import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import {
  EdgeError,
  mensagemDoErro,
  criarPedido,
  solicitarFechamento,
  fecharConta,
} from "./edge";

type Client = SupabaseClient<Database>;

// Client falso: só o que edge.ts usa (functions.invoke).
function fakeClient(invokeImpl: (...a: unknown[]) => unknown) {
  const invoke = vi.fn(invokeImpl);
  return { client: { functions: { invoke } } as unknown as Client, invoke };
}

// Simula o erro que o supabase-js entrega quando a function responde não-2xx:
// um FunctionsHttpError com `.context` = Response com o corpo { error, message }.
function httpError(status: number, body: { error: string; message?: string }) {
  return {
    error: {
      name: "FunctionsHttpError",
      message: "Edge Function returned a non-2xx status code",
      context: new Response(JSON.stringify(body), { status }),
    },
    data: null,
  };
}

const COMANDA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const FECHAMENTO = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ITEM = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

describe("mensagemDoErro", () => {
  it("traduz um código de negócio conhecido", () => {
    expect(mensagemDoErro(new EdgeError("COMANDA_NAO_ABERTA", "x"))).toBe(
      "Esta comanda não está mais aberta para novos pedidos.",
    );
  });

  it("cai na message do EdgeError quando o código é desconhecido", () => {
    expect(mensagemDoErro(new EdgeError("CODIGO_NOVO", "algo específico"))).toBe(
      "algo específico",
    );
  });

  it("usa a message de um Error comum", () => {
    expect(mensagemDoErro(new Error("boom"))).toBe("boom");
  });

  it("tem fallback para valores não-Error", () => {
    expect(mensagemDoErro("qualquer coisa")).toBe(
      "Erro inesperado. Tente novamente.",
    );
  });
});

describe("criarPedido", () => {
  it("chama a function com comanda_id + itens e devolve os dados", async () => {
    const dados = {
      pedido: { id: "p1", comanda_id: COMANDA, status: "recebido", created_at: "" },
      itens: [],
    };
    const { client, invoke } = fakeClient(() => ({ data: dados, error: null }));

    const out = await criarPedido(client, COMANDA, [
      { item_cardapio_id: ITEM, quantidade: 2 },
    ]);

    expect(invoke).toHaveBeenCalledWith("criar-pedido", {
      body: { comanda_id: COMANDA, itens: [{ item_cardapio_id: ITEM, quantidade: 2 }] },
    });
    expect(out).toBe(dados);
  });

  it("levanta EdgeError com o código do backend quando a function falha", async () => {
    const { client } = fakeClient(() =>
      httpError(409, { error: "COMANDA_NAO_ABERTA", message: "..." }),
    );

    await expect(
      criarPedido(client, COMANDA, [{ item_cardapio_id: ITEM, quantidade: 1 }]),
    ).rejects.toMatchObject({ name: "EdgeError", code: "COMANDA_NAO_ABERTA" });
  });
});

describe("solicitarFechamento", () => {
  it("envia comanda_id no corpo", async () => {
    const { client, invoke } = fakeClient(() => ({
      data: { id: FECHAMENTO },
      error: null,
    }));
    await solicitarFechamento(client, COMANDA);
    expect(invoke).toHaveBeenCalledWith("solicitar-fechamento", {
      body: { comanda_id: COMANDA },
    });
  });
});

describe("fecharConta", () => {
  it("envia fechamento_id + forma_pagamento", async () => {
    const { client, invoke } = fakeClient(() => ({
      data: { id: FECHAMENTO, status: "fechado" },
      error: null,
    }));
    await fecharConta(client, FECHAMENTO, "pix");
    expect(invoke).toHaveBeenCalledWith("fechar-conta", {
      body: { fechamento_id: FECHAMENTO, forma_pagamento: "pix" },
    });
  });

  it("propaga SEM_PERMISSAO como EdgeError", async () => {
    const { client } = fakeClient(() =>
      httpError(403, { error: "SEM_PERMISSAO", message: "..." }),
    );
    await expect(fecharConta(client, FECHAMENTO, "pix")).rejects.toMatchObject({
      code: "SEM_PERMISSAO",
    });
  });
});
