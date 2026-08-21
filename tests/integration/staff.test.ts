// Testes de INTEGRAÇÃO do outro lado do balcão: COZINHA e CAIXA, contra o
// backend local. O caminho do cliente (mesa) está em cliente.test.ts.
//
// Pré-requisitos para RODAR (senão, todo o describe se auto-ignora):
//   - Docker aberto + `supabase start` + `supabase db reset` (reaplica o seed).
//   - Edge Functions servidas (`supabase functions serve`).
//   - Variáveis: INTEGRATION=1, SUPABASE_URL, SUPABASE_ANON_KEY e
//     SUPABASE_SERVICE_ROLE_KEY (ver a nota sobre staff mais abaixo).
// O jeito fácil é `npm run test:int:full` (ver scripts/run-integration.ps1),
// que sobe o stack, reaplica o seed, serve as functions e exporta as três chaves.
//
// Exercitam o MESMO código do app: o client de staff autenticado pelo Supabase
// Auth (as mesmas queries de CozinhaDashboard/CaixaDashboard) e o wrapper
// `fecharConta` de src/lib/edge.ts.
//
// Nota sobre staff: o seed.sql do backend não cria nenhum usuário de staff, então
// os usuários de cozinha/caixa são provisionados aqui pelo Auth admin (helper
// `staffClient`) e o login é feito por signInWithPassword, como no app. É por
// isso que este arquivo pede a SUPABASE_SERVICE_ROLE_KEY.
//
// Este arquivo tem estado sequencial de propósito (a conta é fechada no fim), mas
// não depende de nenhum outro arquivo: ele cria a própria mesa/comanda.
import { describe, it, expect, beforeAll } from "vitest";
import {
  INTEGRATION,
  SERVICE_KEY,
  type Client,
  comandaClient,
  recriarComandaAberta,
  serviceClient,
  staffClient,
  staffEmail,
} from "./helpers";
import { criarPedido, solicitarFechamento, fecharConta } from "@/lib/edge";

// Mesa/comanda exclusivas deste arquivo. Número alto para não colidir com o seed
// (1–3) nem com os testes de Edge Function do backend (9000+).
const MESA_STAFF = 9501;
const TOKEN_STAFF = "token-teste-staff-9501";

// Data qualquer, fixa, para tentar (e falhar em) alterar uma coluna que não é status.
const OUTRA_DATA = "2020-01-01T00:00:00.000Z";

describe.skipIf(!INTEGRATION)("staff: cozinha e caixa (integração)", () => {
  // Criados no beforeAll — não no corpo do describe — para não instanciar client
  // (que exige URL/chave) quando o bloco está sendo apenas ignorado.
  let db: Client;
  let cozinha: Client;
  let caixa: Client;
  let cliente: Client;

  let mesaId = "";
  let comandaId = "";
  // Pedido que a cozinha vai levar até 'entregue' (entra no total da conta).
  let pedidoEntregueId = "";
  // Pedido que fica em 'recebido' (NÃO entra no total).
  let pedidoPendenteId = "";
  let totalEsperado = 0;
  let fechamentoId = "";

  beforeAll(async () => {
    if (!SERVICE_KEY) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY ausente. O seed.sql do backend não cria staff, " +
          "então estes testes provisionam os usuários de cozinha/caixa pelo Auth " +
          "admin. Rode `npm run test:int:full` (que exporta a chave) ou exporte-a " +
          "à mão a partir de `supabase status -o env`.",
      );
    }

    db = serviceClient();
    [cozinha, caixa] = await Promise.all([staffClient("cozinha"), staffClient("caixa")]);

    const fixture = await recriarComandaAberta(db, MESA_STAFF, TOKEN_STAFF);
    mesaId = fixture.mesaId;
    comandaId = fixture.comandaId;
    cliente = comandaClient(TOKEN_STAFF);

    // Dois itens disponíveis, em ordem fixa, para o total ser previsível.
    const { data: itens } = await cliente
      .from("itens_cardapio")
      .select("id")
      .order("nome", { ascending: true })
      .limit(2);
    if (!itens || itens.length < 2) {
      throw new Error(
        "Cardápio do seed não encontrado — rode `supabase db reset` antes.",
      );
    }

    // Pedido que será entregue: 2 do primeiro item + 1 do segundo.
    const entregue = await criarPedido(cliente, comandaId, [
      { item_cardapio_id: itens[0].id, quantidade: 2 },
      { item_cardapio_id: itens[1].id, quantidade: 1 },
    ]);
    pedidoEntregueId = entregue.pedido.id;
    // O total é do banco: soma dos preços CONGELADOS pelo servidor no pedido.
    totalEsperado = entregue.itens.reduce(
      (soma, item) => soma + item.quantidade * Number(item.preco_unitario_registrado),
      0,
    );

    // Pedido que fica na fila e não deve entrar na conta.
    const pendente = await criarPedido(cliente, comandaId, [
      { item_cardapio_id: itens[0].id, quantidade: 1 },
    ]);
    pedidoPendenteId = pendente.pedido.id;
  });

  describe("cozinha", () => {
    it("autentica e enxerga só a própria linha em staff", async () => {
      const {
        data: { user },
      } = await cozinha.auth.getUser();
      expect(user?.email).toBe(staffEmail("cozinha"));

      const { data, error } = await cozinha.from("staff").select("papel");
      expect(error).toBeNull();
      // A linha do caixa existe no banco, mas a RLS mostra apenas a própria.
      expect(data).toEqual([{ papel: "cozinha" }]);
    });

    it("enxerga a fila de pedidos com os itens do cardápio", async () => {
      // Mesma query do CozinhaDashboard (a fila é global; filtramos os nossos).
      const { data, error } = await cozinha
        .from("pedidos")
        .select("id, comanda_id, status, itens_pedido(quantidade, itens_cardapio(nome))")
        .in("status", ["recebido", "preparo", "pronto"])
        .order("created_at", { ascending: true });

      expect(error).toBeNull();
      const nossos = (data ?? []).filter((p) => p.comanda_id === comandaId);
      // Ordem de criação: o dashboard mostra a fila em FIFO.
      expect(nossos.map((p) => p.id)).toEqual([pedidoEntregueId, pedidoPendenteId]);
      expect(nossos[0].status).toBe("recebido");
      expect(nossos[0].itens_pedido).toHaveLength(2);
      expect(nossos[0].itens_pedido.every((i) => !!i.itens_cardapio?.nome)).toBe(true);
    });

    it("avança o pedido: recebido -> preparo -> pronto -> entregue", async () => {
      for (const alvo of ["preparo", "pronto", "entregue"] as const) {
        const { data, error } = await cozinha
          .from("pedidos")
          .update({ status: alvo })
          .eq("id", pedidoEntregueId)
          .select("status");
        expect(error).toBeNull();
        expect(data).toEqual([{ status: alvo }]);
      }
    });

    it("o pedido entregue sai da fila e o pendente continua nela", async () => {
      const { data } = await cozinha
        .from("pedidos")
        .select("id")
        .eq("comanda_id", comandaId)
        .in("status", ["recebido", "preparo", "pronto"]);
      const ids = (data ?? []).map((p) => p.id);
      expect(ids).toContain(pedidoPendenteId);
      expect(ids).not.toContain(pedidoEntregueId);
    });

    it("é recusada ao alterar uma coluna de pedidos que não é status", async () => {
      const { data: antes } = await cozinha
        .from("pedidos")
        .select("created_at")
        .eq("id", pedidoPendenteId)
        .single();

      const { error } = await cozinha
        .from("pedidos")
        .update({ created_at: OUTRA_DATA })
        .eq("id", pedidoPendenteId)
        .select("id");

      // Trigger pedidos_cozinha_somente_status: raise com errcode 42501.
      expect(error?.code).toBe("42501");
      expect(error?.message).toContain("COZINHA_SO_ALTERA_STATUS");

      const { data: depois } = await cozinha
        .from("pedidos")
        .select("created_at")
        .eq("id", pedidoPendenteId)
        .single();
      expect(depois?.created_at).toBe(antes?.created_at);
    });
  });

  // Pré-requisito do caixa: é o cliente quem pede a conta. Serve também para
  // provar que o total sai do banco e conta só os pedidos ENTREGUES.
  describe("cliente pede a conta", () => {
    it("o fechamento nasce 'solicitado' com o total só dos pedidos entregues", async () => {
      const fechamento = await solicitarFechamento(cliente, comandaId);
      fechamentoId = fechamento.id;

      expect(fechamento.status).toBe("solicitado");
      expect(fechamento.comanda_id).toBe(comandaId);
      // O pedido que ficou em 'recebido' está de fora da soma.
      expect(Number(fechamento.total)).toBeCloseTo(totalEsperado, 2);
    });
  });

  describe("isolamento de papel", () => {
    it("cozinha NÃO enxerga fechamentos", async () => {
      const { data, error } = await cozinha.from("fechamentos").select("id");
      expect(error).toBeNull();
      expect(data ?? []).toHaveLength(0);
    });

    it("cozinha NÃO enxerga comandas nem mesas", async () => {
      const { data: comandas } = await cozinha.from("comandas").select("id");
      const { data: mesas } = await cozinha.from("mesas").select("id");
      expect(comandas ?? []).toHaveLength(0);
      expect(mesas ?? []).toHaveLength(0);
    });

    it("cozinha NÃO atualiza fechamento (nenhuma linha afetada)", async () => {
      const { data, error } = await cozinha
        .from("fechamentos")
        .update({ status: "fechado" })
        .eq("id", fechamentoId)
        .select("id");
      // Sem policy de UPDATE para cozinha, a linha simplesmente não existe para ela.
      expect(error).toBeNull();
      expect(data ?? []).toHaveLength(0);

      // Quem pode ler confirma que nada mudou.
      const { data: doCaixa } = await caixa
        .from("fechamentos")
        .select("status")
        .eq("id", fechamentoId)
        .single();
      expect(doCaixa?.status).toBe("solicitado");
    });

    it("caixa NÃO muda o status de um pedido (nenhuma linha afetada)", async () => {
      const { data, error } = await caixa
        .from("pedidos")
        .update({ status: "entregue" })
        .eq("id", pedidoPendenteId)
        .select("id");
      expect(error).toBeNull();
      expect(data ?? []).toHaveLength(0);

      const { data: daCozinha } = await cozinha
        .from("pedidos")
        .select("status")
        .eq("id", pedidoPendenteId)
        .single();
      expect(daCozinha?.status).toBe("recebido");
    });

    it("cozinha NÃO fecha a conta: SEM_PERMISSAO", async () => {
      await expect(fecharConta(cozinha, fechamentoId, "pix")).rejects.toMatchObject({
        code: "SEM_PERMISSAO",
      });
    });
  });

  describe("caixa", () => {
    it("autentica e enxerga só a própria linha em staff", async () => {
      const {
        data: { user },
      } = await caixa.auth.getUser();
      expect(user?.email).toBe(staffEmail("caixa"));

      const { data, error } = await caixa.from("staff").select("papel");
      expect(error).toBeNull();
      expect(data).toEqual([{ papel: "caixa" }]);
    });

    it("enxerga a conta pendente com o número da mesa", async () => {
      // Mesma query do CaixaDashboard (a lista é global; achamos a nossa).
      const { data, error } = await caixa
        .from("fechamentos")
        .select("id, status, total, comandas(mesas(numero))")
        .in("status", ["solicitado", "avisado"])
        .order("solicitado_em", { ascending: true });

      expect(error).toBeNull();
      const nossa = (data ?? []).find((f) => f.id === fechamentoId);
      expect(nossa?.comandas?.mesas?.numero).toBe(MESA_STAFF);
      expect(Number(nossa?.total)).toBeCloseTo(totalEsperado, 2);
    });

    it("avisa o garçom: fechamento vai para 'avisado'", async () => {
      const { data, error } = await caixa
        .from("fechamentos")
        .update({ status: "avisado" })
        .eq("id", fechamentoId)
        .select("status");
      expect(error).toBeNull();
      expect(data).toEqual([{ status: "avisado" }]);
    });

    // Daqui para baixo a comanda fica FECHADA — deixado por último de propósito.
    it("fecha a conta com a forma de pagamento e o total vindo do banco", async () => {
      const fechamento = await fecharConta(caixa, fechamentoId, "pix");
      expect(fechamento.status).toBe("fechado");
      expect(fechamento.forma_pagamento).toBe("pix");
      expect(Number(fechamento.total)).toBeCloseTo(totalEsperado, 2);
      expect(fechamento.fechado_em).not.toBeNull();
    });

    it("ao fechar a conta, a comanda fica fechada e a mesa livre", async () => {
      const { data: comanda } = await caixa
        .from("comandas")
        .select("status")
        .eq("id", comandaId)
        .single();
      expect(comanda?.status).toBe("fechada");

      const { data: mesa } = await caixa
        .from("mesas")
        .select("status")
        .eq("id", mesaId)
        .single();
      expect(mesa?.status).toBe("livre");
    });

    it("fechar a mesma conta de novo é recusado: FECHAMENTO_JA_FECHADO", async () => {
      await expect(fecharConta(caixa, fechamentoId, "dinheiro")).rejects.toMatchObject({
        code: "FECHAMENTO_JA_FECHADO",
      });
    });

    it("a conta fechada sai da lista do caixa", async () => {
      const { data } = await caixa
        .from("fechamentos")
        .select("id")
        .in("status", ["solicitado", "avisado"]);
      expect((data ?? []).map((f) => f.id)).not.toContain(fechamentoId);
    });
  });

  describe("comanda fechada", () => {
    it("novo pedido na comanda fechada é recusado: COMANDA_NAO_ABERTA", async () => {
      const { data: itens } = await cliente
        .from("itens_cardapio")
        .select("id")
        .order("nome", { ascending: true })
        .limit(1);
      await expect(
        criarPedido(cliente, comandaId, [
          { item_cardapio_id: itens?.[0]?.id ?? "", quantidade: 1 },
        ]),
      ).rejects.toMatchObject({ code: "COMANDA_NAO_ABERTA" });
    });
  });
});
