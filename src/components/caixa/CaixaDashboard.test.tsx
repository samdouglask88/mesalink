import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within, act, fireEvent } from "@testing-library/react";
import {
  fakeSupabase,
  linhas,
  falha,
  type FakeSupabase,
  type Resposta,
} from "@/test/fake-supabase";
import CaixaDashboard from "./CaixaDashboard";
import { EdgeError, fecharConta } from "@/lib/edge";
import type { Fechamento } from "@/lib/database.types";

// Fronteiras mockadas: o client Supabase (rede + realtime), a Edge Function
// fechar-conta e o router do Next (usado pelo StaffHeader). `mensagemDoErro`
// fica real — é ele que traduz o código de negócio para o texto da tela.
let fake: FakeSupabase;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => fake.client,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

vi.mock("@/lib/edge", async (importarReal) => {
  const real = await importarReal<typeof import("@/lib/edge")>();
  return { ...real, fecharConta: vi.fn() };
});

const fecharContaMock = vi.mocked(fecharConta);

// Formato da linha que a leitura de `fechamentos` devolve para o caixa.
type FechamentoLinha = Fechamento & {
  comandas: { mesas: { numero: number } | null } | null;
};

const fechamento = (over: Partial<FechamentoLinha> = {}): FechamentoLinha => ({
  id: "f1",
  comanda_id: "c1",
  status: "solicitado",
  total: 137.5,
  forma_pagamento: null,
  solicitado_em: "2026-07-21T13:45:00Z",
  fechado_em: null,
  comandas: { mesas: { numero: 7 } },
  ...over,
});

beforeEach(() => {
  fecharContaMock.mockReset();
  fecharContaMock.mockResolvedValue(fechamento({ status: "fechado" }));
});

async function montar(resposta: Resposta = linhas([])) {
  fake = fakeSupabase(resposta);
  const utils = render(<CaixaDashboard nome="Bia" />);
  // deixa o refetch disparado pelo efeito inicial terminar.
  await act(async () => {});
  return utils;
}

/** O <li> de uma conta da lista, achado pelo próprio título. */
function conta(titulo: string): HTMLElement {
  const cabecalho = screen.getByRole("heading", { level: 2, name: titulo });
  const item = cabecalho.closest("li");
  if (!item) throw new Error(`conta "${titulo}" não encontrada`);
  return item;
}

async function clicarNa(titulo: string, nome: RegExp | string) {
  await act(async () => {
    fireEvent.click(within(conta(titulo)).getByRole("button", { name: nome }));
  });
}

describe("CaixaDashboard — lista de contas", () => {
  it("mostra uma conta por fechamento aguardando", async () => {
    await montar(
      linhas([
        fechamento({ id: "f1", comandas: { mesas: { numero: 7 } } }),
        fechamento({ id: "f2", comandas: { mesas: { numero: 8 } } }),
      ]),
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("identifica a conta pelo número da mesa", async () => {
    await montar(linhas([fechamento({ comandas: { mesas: { numero: 7 } } })]));
    expect(screen.getByRole("heading", { level: 2, name: "Mesa 7" })).toBeInTheDocument();
  });

  it("cai no rótulo 'Conta' quando a mesa não veio", async () => {
    await montar(linhas([fechamento({ comandas: null })]));
    expect(screen.getByRole("heading", { level: 2, name: "Conta" })).toBeInTheDocument();
  });

  it("mostra o status do fechamento", async () => {
    await montar(linhas([fechamento({ status: "avisado" })]));
    expect(within(conta("Mesa 7")).getByText("Garçom avisado")).toBeInTheDocument();
  });

  it("lista as contas na ordem em que o backend devolveu", async () => {
    await montar(
      linhas([
        fechamento({ id: "f1", comandas: { mesas: { numero: 9 } } }),
        fechamento({ id: "f2", comandas: { mesas: { numero: 3 } } }),
      ]),
    );
    const itens = screen.getAllByRole("listitem");
    expect(itens[0]).toHaveTextContent("Mesa 9");
    expect(itens[1]).toHaveTextContent("Mesa 3");
  });

  it("pede ao backend só as contas ainda não fechadas", async () => {
    await montar(linhas([]));
    expect(fake.selects[0].filtroIn).toEqual({
      coluna: "status",
      valores: ["solicitado", "avisado"],
    });
  });

  it("pede as contas na ordem em que foram solicitadas", async () => {
    await montar(linhas([]));
    expect(fake.selects[0].ordem).toEqual({ coluna: "solicitado_em", ascending: true });
  });
});

describe("CaixaDashboard — o total vem do backend", () => {
  it("mostra o total exatamente como veio na linha do fechamento", async () => {
    await montar(linhas([fechamento({ total: 1234.56 })]));
    expect(within(conta("Mesa 7")).getByText(/^R\$\s*1\.234,56$/)).toBeInTheDocument();
  });

  it("não busca preço nenhum para montar o total", async () => {
    await montar(linhas([fechamento({ total: 1234.56 })]));
    expect(fake.selects.map((s) => s.colunas)).toEqual(["*, comandas(mesas(numero))"]);
  });

  it("não recalcula o total ao escolher a forma de pagamento", async () => {
    await montar(linhas([fechamento({ total: 1234.56 })]));
    await clicarNa("Mesa 7", "Pix");
    expect(within(conta("Mesa 7")).getByText(/^R\$\s*1\.234,56$/)).toBeInTheDocument();
  });
});

describe("CaixaDashboard — estado vazio e erro", () => {
  it("mostra 'Tudo em dia' quando não há conta aguardando", async () => {
    await montar(linhas([]));
    expect(screen.getByText("Tudo em dia")).toBeInTheDocument();
  });

  it("não mostra lista quando não há conta aguardando", async () => {
    await montar(linhas([]));
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("mostra a mensagem do backend quando a leitura falha", async () => {
    await montar(falha("permission denied for table fechamentos"));
    expect(
      screen.getByText("permission denied for table fechamentos"),
    ).toBeInTheDocument();
  });
});

describe("CaixaDashboard — avisar garçom", () => {
  it("oferece avisar o garçom enquanto o fechamento está só solicitado", async () => {
    await montar(linhas([fechamento({ status: "solicitado" })]));
    expect(
      within(conta("Mesa 7")).getByRole("button", { name: /avisar garçom/i }),
    ).toBeInTheDocument();
  });

  it("não oferece avisar o garçom quando ele já foi avisado", async () => {
    await montar(linhas([fechamento({ status: "avisado" })]));
    expect(
      within(conta("Mesa 7")).queryByRole("button", { name: /avisar garçom/i }),
    ).toBeNull();
  });

  it("envia status 'avisado' para o fechamento clicado", async () => {
    await montar(linhas([fechamento({ id: "f1", status: "solicitado" })]));
    await clicarNa("Mesa 7", /avisar garçom/i);

    expect(fake.updates[0]).toEqual({
      tabela: "fechamentos",
      valores: { status: "avisado" },
      filtroEq: { coluna: "id", valor: "f1" },
    });
  });

  it("refaz a leitura depois de avisar o garçom", async () => {
    await montar(linhas([fechamento({ status: "solicitado" })]));
    await clicarNa("Mesa 7", /avisar garçom/i);
    expect(fake.selects).toHaveLength(2);
  });

  it("mostra a mensagem do backend quando avisar o garçom é barrado", async () => {
    await montar(linhas([fechamento({ status: "solicitado" })]));
    fake.responderUpdate({ error: { message: "new row violates row-level security" } });
    await clicarNa("Mesa 7", /avisar garçom/i);

    expect(
      screen.getByText("new row violates row-level security"),
    ).toBeInTheDocument();
  });
});

describe("CaixaDashboard — confirmar pagamento", () => {
  it("fecha a conta pela Edge Function com o id e a forma escolhida", async () => {
    await montar(linhas([fechamento({ id: "f1" })]));
    await clicarNa("Mesa 7", "Pix");
    await clicarNa("Mesa 7", /confirmar pagamento/i);

    expect(fecharContaMock).toHaveBeenCalledWith(fake.client, "f1", "pix");
  });

  it("manda a forma que o caixa realmente escolheu por último", async () => {
    await montar(linhas([fechamento({ id: "f1" })]));
    await clicarNa("Mesa 7", "Pix");
    await clicarNa("Mesa 7", "Dinheiro");
    await clicarNa("Mesa 7", /confirmar pagamento/i);

    expect(fecharContaMock).toHaveBeenCalledWith(fake.client, "f1", "dinheiro");
  });

  it("não fecha a conta sem forma de pagamento escolhida", async () => {
    await montar(linhas([fechamento()]));
    await clicarNa("Mesa 7", /confirmar pagamento/i);
    expect(fecharContaMock).not.toHaveBeenCalled();
  });

  it("pede para escolher a forma de pagamento antes de confirmar", async () => {
    await montar(linhas([fechamento()]));
    await clicarNa("Mesa 7", /confirmar pagamento/i);
    expect(screen.getByText("Selecione a forma de pagamento.")).toBeInTheDocument();
  });

  it("não usa a forma escolhida numa conta para fechar a outra", async () => {
    await montar(
      linhas([
        fechamento({ id: "f1", comandas: { mesas: { numero: 7 } } }),
        fechamento({ id: "f2", comandas: { mesas: { numero: 8 } } }),
      ]),
    );
    await clicarNa("Mesa 7", "Pix");
    await clicarNa("Mesa 8", /confirmar pagamento/i);

    expect(fecharContaMock).not.toHaveBeenCalled();
  });

  it("refaz a leitura depois de fechar a conta", async () => {
    await montar(linhas([fechamento()]));
    await clicarNa("Mesa 7", "Crédito");
    await clicarNa("Mesa 7", /confirmar pagamento/i);

    expect(fake.selects).toHaveLength(2);
  });

  it("traduz o código de negócio devolvido pela Edge Function", async () => {
    fecharContaMock.mockRejectedValue(
      new EdgeError("FECHAMENTO_JA_FECHADO", "detalhe cru do backend"),
    );
    await montar(linhas([fechamento()]));
    await clicarNa("Mesa 7", "Débito");
    await clicarNa("Mesa 7", /confirmar pagamento/i);

    expect(screen.getByText("Esta conta já foi fechada.")).toBeInTheDocument();
  });

  it("não refaz a leitura quando o fechamento falha", async () => {
    fecharContaMock.mockRejectedValue(new EdgeError("SEM_PERMISSAO", "x"));
    await montar(linhas([fechamento()]));
    await clicarNa("Mesa 7", "Débito");
    await clicarNa("Mesa 7", /confirmar pagamento/i);

    expect(fake.selects).toHaveLength(1);
  });

  it("desabilita a confirmação enquanto o fechamento está em curso", async () => {
    let liberar: (f: Fechamento) => void = () => {};
    fecharContaMock.mockReturnValue(
      new Promise<Fechamento>((resolve) => {
        liberar = resolve;
      }),
    );

    await montar(linhas([fechamento()]));
    await clicarNa("Mesa 7", "Pix");
    await clicarNa("Mesa 7", /confirmar pagamento/i);

    expect(
      within(conta("Mesa 7")).getByRole("button", { name: /processando/i }),
    ).toBeDisabled();

    await act(async () => {
      liberar(fechamento({ status: "fechado" }));
    });
  });

  it("volta a habilitar a confirmação quando o fechamento termina", async () => {
    await montar(linhas([fechamento()]));
    await clicarNa("Mesa 7", "Pix");
    await clicarNa("Mesa 7", /confirmar pagamento/i);

    expect(
      within(conta("Mesa 7")).getByRole("button", { name: /confirmar pagamento/i }),
    ).toBeEnabled();
  });
});

describe("CaixaDashboard — Realtime", () => {
  it("assina um canal ao montar", async () => {
    await montar(linhas([]));
    expect(fake.canais).toMatchObject([{ nome: "caixa-fechamentos", inscrito: true }]);
  });

  it("observa as mudanças da tabela fechamentos", async () => {
    await montar(linhas([]));
    expect(fake.canais[0].filtros).toEqual([
      { event: "*", schema: "public", table: "fechamentos" },
    ]);
  });

  it("refaz a leitura quando o Realtime avisa de uma mudança", async () => {
    await montar(linhas([]));

    fake.responderLeitura(linhas([fechamento({ comandas: { mesas: { numero: 12 } } })]));
    await act(async () => {
      fake.emitirRealtime();
    });

    expect(screen.getByRole("heading", { level: 2, name: "Mesa 12" })).toBeInTheDocument();
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
