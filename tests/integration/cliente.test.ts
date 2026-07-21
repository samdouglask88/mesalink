// Testes de INTEGRAÇÃO do fluxo do cliente (mesa) contra o backend local.
//
// Pré-requisitos para RODAR (senão, todo o describe se auto-ignora):
//   - Docker aberto + `supabase start` + `supabase db reset` (reaplica o seed).
//   - Edge Functions servidas (`supabase functions serve`).
//   - Variáveis: INTEGRATION=1, SUPABASE_URL, SUPABASE_ANON_KEY.
// O jeito fácil é `npm run test:int:full` (ver scripts/run-integration.ps1),
// que sobe o stack, reaplica o seed, serve as functions e roda estes testes.
//
// Exercitam o MESMO código do app: o client de comanda (anon + x-comanda-token)
// e os wrappers de Edge Function em src/lib/edge.ts.
import { describe, it, expect, beforeAll } from "vitest";
import {
  INTEGRATION,
  SEED_TOKEN,
  comandaClient,
} from "./helpers";
import { criarPedido, solicitarFechamento, EdgeError } from "@/lib/edge";

const RANDOM_UUID = "00000000-0000-4000-8000-000000000000";

describe.skipIf(!INTEGRATION)("cliente da mesa (integração)", () => {
  // Criado no beforeAll — não no corpo do describe — para não instanciar o
  // client (que exige URL/chave) quando o bloco está sendo apenas ignorado.
  let cliente: ReturnType<typeof comandaClient>;
  let comandaId = "";
  let itemDisponivelId = "";

  beforeAll(async () => {
    cliente = comandaClient(SEED_TOKEN);

    const { data: comanda } = await cliente
      .from("comandas")
      .select("id, status")
      .eq("token", SEED_TOKEN)
      .maybeSingle();
    if (!comanda) {
      throw new Error(
        "Comanda do seed não encontrada — rode `supabase db reset` antes.",
      );
    }
    comandaId = comanda.id;

    const { data: itens } = await cliente
      .from("itens_cardapio")
      .select("id")
      .limit(1);
    itemDisponivelId = itens?.[0]?.id ?? "";
  });

  describe("leitura via RLS (x-comanda-token)", () => {
    it("só enxerga itens disponíveis do cardápio", async () => {
      const { data } = await cliente
        .from("itens_cardapio")
        .select("nome, disponivel");
      expect(data && data.length).toBeGreaterThan(0);
      expect(data!.every((i) => i.disponivel)).toBe(true);
      // O 'Milkshake' do seed é indisponível — não pode aparecer.
      expect(data!.some((i) => i.nome === "Milkshake")).toBe(false);
    });

    it("enxerga a própria comanda pelo token", async () => {
      const { data } = await cliente
        .from("comandas")
        .select("id, status")
        .eq("token", SEED_TOKEN)
        .maybeSingle();
      expect(data?.id).toBe(comandaId);
    });

    it("NÃO enxerga a comanda com um token errado", async () => {
      const intruso = comandaClient("token-que-nao-existe");
      const { data } = await intruso.from("comandas").select("id");
      expect(data ?? []).toHaveLength(0);
    });
  });

  describe("criar-pedido (Edge Function)", () => {
    it("cria um pedido 'recebido' com o preço vindo do banco", async () => {
      const { pedido, itens } = await criarPedido(cliente, comandaId, [
        { item_cardapio_id: itemDisponivelId, quantidade: 2 },
      ]);
      expect(pedido.status).toBe("recebido");
      expect(pedido.comanda_id).toBe(comandaId);
      expect(itens).toHaveLength(1);
      expect(itens[0].quantidade).toBe(2);
      // O preço é "congelado" pelo backend; o client nunca o envia.
      expect(Number(itens[0].preco_unitario_registrado)).toBeGreaterThan(0);
    });

    it("o pedido criado passa a ser visível para o cliente", async () => {
      const { data } = await cliente
        .from("pedidos")
        .select("id")
        .eq("comanda_id", comandaId);
      expect((data ?? []).length).toBeGreaterThan(0);
    });

    it("recusa item inexistente com ITEM_NAO_ENCONTRADO", async () => {
      await expect(
        criarPedido(cliente, comandaId, [
          { item_cardapio_id: RANDOM_UUID, quantidade: 1 },
        ]),
      ).rejects.toMatchObject({ code: "ITEM_NAO_ENCONTRADO" });
    });

    it("recusa token inválido com TOKEN_INVALIDO", async () => {
      const intruso = comandaClient("token-que-nao-existe");
      await expect(
        criarPedido(intruso, comandaId, [
          { item_cardapio_id: itemDisponivelId, quantidade: 1 },
        ]),
      ).rejects.toBeInstanceOf(EdgeError);
    });
  });

  // Deixado por último: muda a comanda para 'fechamento_solicitado', o que
  // bloqueia novos pedidos (testado logo em seguida).
  describe("solicitar-fechamento (Edge Function)", () => {
    it("cria o fechamento 'solicitado'", async () => {
      const fechamento = await solicitarFechamento(cliente, comandaId);
      expect(fechamento.status).toBe("solicitado");
      expect(fechamento.comanda_id).toBe(comandaId);
      expect(Number(fechamento.total)).toBeGreaterThanOrEqual(0);
    });

    it("o cliente passa a enxergar o fechamento da sua comanda", async () => {
      const { data } = await cliente
        .from("fechamentos")
        .select("status")
        .eq("comanda_id", comandaId);
      expect((data ?? []).some((f) => f.status === "solicitado")).toBe(true);
    });

    it("após solicitar fechamento, novos pedidos são recusados", async () => {
      await expect(
        criarPedido(cliente, comandaId, [
          { item_cardapio_id: itemDisponivelId, quantidade: 1 },
        ]),
      ).rejects.toMatchObject({ code: "COMANDA_NAO_ABERTA" });
    });
  });
});
