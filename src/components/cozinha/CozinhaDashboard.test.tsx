import { describe, it, expect, vi } from "vitest";
import { render, screen, within, act, fireEvent } from "@testing-library/react";
import {
  fakeSupabase,
  linhas,
  falha,
  type FakeSupabase,
  type Resposta,
} from "@/test/fake-supabase";
import CozinhaDashboard from "./CozinhaDashboard";
import type { StatusPedido } from "@/lib/database.types";

// Fronteiras mockadas: o client Supabase (rede + realtime) e o router do Next
// (o StaffHeader chama useRouter). O dashboard roda de verdade.
let fake: FakeSupabase;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => fake.client,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

// Formato da linha que a leitura de `pedidos` devolve para a cozinha.
type PedidoLinha = {
  id: string;
  status: StatusPedido;
  created_at: string;
  itens_pedido: { quantidade: number; itens_cardapio: { nome: string } | null }[];
};

const pedido = (over: Partial<PedidoLinha> = {}): PedidoLinha => ({
  id: "p1",
  status: "recebido",
  created_at: "2026-07-21T13:45:00Z",
  itens_pedido: [{ quantidade: 1, itens_cardapio: { nome: "Classic Burger" } }],
  ...over,
});

async function montar(resposta: Resposta = linhas([])) {
  fake = fakeSupabase(resposta);
  const utils = render(<CozinhaDashboard nome="Ana" />);
  // deixa o refetch disparado pelo efeito inicial terminar.
  await act(async () => {});
  return utils;
}

/** A <section> de uma coluna do kanban, achada pelo próprio título. */
function coluna(titulo: string): HTMLElement {
  const cabecalho = screen.getByRole("heading", { level: 2, name: titulo });
  const secao = cabecalho.closest("section");
  if (!secao) throw new Error(`coluna "${titulo}" não encontrada`);
  return secao;
}

async function clicar(nome: RegExp | string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: nome }));
  });
}

describe("CozinhaDashboard — fila de pedidos", () => {
  it("distribui cada pedido na coluna do seu status", async () => {
    await montar(
      linhas([
        pedido({
          id: "p1",
          status: "recebido",
          itens_pedido: [{ quantidade: 1, itens_cardapio: { nome: "Classic Burger" } }],
        }),
        pedido({
          id: "p2",
          status: "preparo",
          itens_pedido: [{ quantidade: 1, itens_cardapio: { nome: "Batata Frita" } }],
        }),
        pedido({
          id: "p3",
          status: "pronto",
          itens_pedido: [{ quantidade: 1, itens_cardapio: { nome: "Milkshake" } }],
        }),
      ]),
    );

    expect(within(coluna("Recebidos")).getByText("Classic Burger")).toBeInTheDocument();
    expect(within(coluna("Em preparo")).getByText("Batata Frita")).toBeInTheDocument();
    expect(within(coluna("Prontos")).getByText("Milkshake")).toBeInTheDocument();
  });

  it("mostra a quantidade junto do nome de cada item do pedido", async () => {
    await montar(
      linhas([
        pedido({
          itens_pedido: [
            { quantidade: 3, itens_cardapio: { nome: "Classic Burger" } },
            { quantidade: 2, itens_cardapio: { nome: "Batata Frita" } },
          ],
        }),
      ]),
    );

    const itens = within(coluna("Recebidos")).getAllByRole("listitem");
    expect(itens[0]).toHaveTextContent(/^3\s*Classic Burger$/);
    expect(itens[1]).toHaveTextContent(/^2\s*Batata Frita$/);
  });

  it("cai no rótulo 'Item' quando o nome do item do cardápio não veio", async () => {
    await montar(linhas([pedido({ itens_pedido: [{ quantidade: 1, itens_cardapio: null }] })]));
    expect(within(coluna("Recebidos")).getByText("Item")).toBeInTheDocument();
  });

  it("mostra a contagem de pedidos no cabeçalho da coluna", async () => {
    await montar(
      linhas([
        pedido({ id: "p1", itens_pedido: [{ quantidade: 1, itens_cardapio: { nome: "A" } }] }),
        pedido({ id: "p2", itens_pedido: [{ quantidade: 3, itens_cardapio: { nome: "B" } }] }),
      ]),
    );
    expect(within(coluna("Recebidos")).getByText("2")).toBeInTheDocument();
  });

  it("lista os pedidos na ordem em que o backend devolveu", async () => {
    await montar(
      linhas([
        pedido({
          id: "p1",
          itens_pedido: [{ quantidade: 1, itens_cardapio: { nome: "Primeiro" } }],
        }),
        pedido({
          id: "p2",
          itens_pedido: [{ quantidade: 1, itens_cardapio: { nome: "Segundo" } }],
        }),
      ]),
    );

    const artigos = within(coluna("Recebidos")).getAllByRole("article");
    expect(artigos[0]).toHaveTextContent("Primeiro");
    expect(artigos[1]).toHaveTextContent("Segundo");
  });

  it("não tem coluna para pedidos entregues", async () => {
    await montar(linhas([]));
    expect(screen.queryByRole("heading", { name: /entregue/i })).toBeNull();
  });

  it("pede ao backend só os pedidos que a cozinha ainda toca", async () => {
    await montar(linhas([]));
    expect(fake.selects[0].filtroIn).toEqual({
      coluna: "status",
      valores: ["recebido", "preparo", "pronto"],
    });
  });

  it("pede os pedidos em ordem de chegada", async () => {
    await montar(linhas([]));
    expect(fake.selects[0].ordem).toEqual({ coluna: "created_at", ascending: true });
  });

  it("não busca preço nenhum — a cozinha não lida com dinheiro", async () => {
    await montar(linhas([pedido()]));
    expect(fake.selects[0].colunas).not.toMatch(/preco/);
  });
});

describe("CozinhaDashboard — estado vazio e erro", () => {
  it("mostra 'Nada por aqui' em cada coluna sem pedido", async () => {
    await montar(linhas([]));
    expect(screen.getAllByText("Nada por aqui")).toHaveLength(3);
  });

  it("mostra a mensagem do backend quando a leitura falha", async () => {
    await montar(falha("permission denied for table pedidos"));
    expect(screen.getByText("permission denied for table pedidos")).toBeInTheDocument();
  });

  it("não mostra pedido nenhum quando a leitura falha", async () => {
    await montar(falha("permission denied for table pedidos"));
    expect(screen.queryByRole("article")).toBeNull();
  });
});

describe("CozinhaDashboard — avançar status", () => {
  it("envia status 'preparo' ao iniciar o preparo de um pedido recebido", async () => {
    await montar(linhas([pedido({ id: "p1", status: "recebido" })]));
    await clicar("Iniciar preparo");

    expect(fake.updates[0]).toEqual({
      tabela: "pedidos",
      valores: { status: "preparo" },
      filtroEq: { coluna: "id", valor: "p1" },
    });
  });

  it("envia status 'pronto' ao marcar pronto um pedido em preparo", async () => {
    await montar(linhas([pedido({ id: "p2", status: "preparo" })]));
    await clicar("Marcar pronto");

    expect(fake.updates[0]).toEqual({
      tabela: "pedidos",
      valores: { status: "pronto" },
      filtroEq: { coluna: "id", valor: "p2" },
    });
  });

  it("envia status 'entregue' ao marcar entregue um pedido pronto", async () => {
    await montar(linhas([pedido({ id: "p3", status: "pronto" })]));
    await clicar("Marcar entregue");

    expect(fake.updates[0]).toEqual({
      tabela: "pedidos",
      valores: { status: "entregue" },
      filtroEq: { coluna: "id", valor: "p3" },
    });
  });

  it("refaz a leitura depois de avançar o status", async () => {
    await montar(linhas([pedido({ id: "p1", status: "recebido" })]));
    await clicar("Iniciar preparo");
    expect(fake.selects).toHaveLength(2);
  });

  it("mostra a mensagem do backend quando o update é barrado", async () => {
    await montar(linhas([pedido({ id: "p1", status: "recebido" })]));
    fake.responderUpdate({ error: { message: "new row violates row-level security" } });
    await clicar("Iniciar preparo");

    expect(
      screen.getByText("new row violates row-level security"),
    ).toBeInTheDocument();
  });

  it("não refaz a leitura quando o update é barrado", async () => {
    await montar(linhas([pedido({ id: "p1", status: "recebido" })]));
    fake.responderUpdate({ error: { message: "new row violates row-level security" } });
    await clicar("Iniciar preparo");

    expect(fake.selects).toHaveLength(1);
  });
});

describe("CozinhaDashboard — Realtime", () => {
  it("assina um canal ao montar", async () => {
    await montar(linhas([]));
    expect(fake.canais).toMatchObject([{ nome: "cozinha-pedidos", inscrito: true }]);
  });

  it("observa as mudanças da tabela pedidos", async () => {
    await montar(linhas([]));
    expect(fake.canais[0].filtros).toEqual([
      { event: "*", schema: "public", table: "pedidos" },
    ]);
  });

  it("refaz a leitura quando o Realtime avisa de uma mudança", async () => {
    await montar(linhas([]));

    fake.responderLeitura(
      linhas([pedido({ itens_pedido: [{ quantidade: 1, itens_cardapio: { nome: "Recém-chegado" } }] })]),
    );
    await act(async () => {
      fake.emitirRealtime();
    });

    expect(screen.getByText("Recém-chegado")).toBeInTheDocument();
  });

  it("remove o canal ao desmontar", async () => {
    const { unmount } = await montar(linhas([]));
    unmount();
    expect(fake.canais[0].removido).toBe(true);
  });

  it("não refaz a leitura depois de desmontar", async () => {
    const { unmount } = await montar(linhas([]));
    unmount();

    await act(async () => {
      fake.emitirRealtime();
    });

    expect(fake.selects).toHaveLength(1);
  });
});
