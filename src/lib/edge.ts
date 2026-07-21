// Wrappers finos sobre as Edge Functions do backend. Toda a regra de negócio
// (preços, atomicidade, permissões) vive no backend; aqui só montamos o request
// e traduzimos o erro que a função devolve num objeto tipado.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Fechamento, Pedido, ItemPedido } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/** Erro de negócio devolvido por uma Edge Function (`{ error, message }`). */
export class EdgeError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "EdgeError";
  }
}

// Mensagens amigáveis (pt-BR) para os códigos que o backend documenta.
const MENSAGENS: Record<string, string> = {
  TOKEN_AUSENTE: "Sessão da mesa não encontrada. Escaneie o QR code novamente.",
  TOKEN_INVALIDO: "Sessão da mesa inválida. Escaneie o QR code novamente.",
  COMANDA_NAO_ENCONTRADA: "Comanda não encontrada.",
  COMANDA_NAO_ABERTA: "Esta comanda não está mais aberta para novos pedidos.",
  COMANDA_JA_FECHADA: "Esta comanda já foi fechada.",
  PEDIDO_SEM_ITENS: "Adicione ao menos um item antes de enviar.",
  QUANTIDADE_INVALIDA: "Quantidade inválida em um dos itens.",
  ITEM_NAO_ENCONTRADO: "Um dos itens não existe mais.",
  ITEM_INDISPONIVEL: "Um dos itens ficou indisponível.",
  FECHAMENTO_NAO_ENCONTRADO: "Fechamento não encontrado.",
  FECHAMENTO_JA_FECHADO: "Esta conta já foi fechada.",
  FORMA_PAGAMENTO_INVALIDA: "Forma de pagamento inválida.",
  NAO_AUTENTICADO: "Você precisa estar logado.",
  SEM_PERMISSAO: "Você não tem permissão para esta ação.",
  ERRO_INTERNO: "Erro inesperado. Tente novamente.",
};

export function mensagemDoErro(err: unknown): string {
  if (err instanceof EdgeError) return MENSAGENS[err.code] ?? err.message;
  if (err instanceof Error) return err.message;
  return "Erro inesperado. Tente novamente.";
}

// Chama uma Edge Function via supabase.functions.invoke e, em caso de erro HTTP,
// lê o corpo `{ error, message }` para levantar um EdgeError com o código real.
async function invoke<T>(
  client: Client,
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await client.functions.invoke<T>(name, { body });

  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const parsed = (await ctx.json()) as { error?: string; message?: string };
        throw new EdgeError(parsed.error ?? "ERRO_INTERNO", parsed.message ?? error.message);
      } catch (e) {
        if (e instanceof EdgeError) throw e;
        // corpo não-JSON: cai no erro genérico abaixo
      }
    }
    throw new EdgeError("ERRO_INTERNO", error.message);
  }

  return data as T;
}

export type ItemPedidoInput = { item_cardapio_id: string; quantidade: number };

/** POST /criar-pedido — o `x-comanda-token` vem no header global do client. */
export function criarPedido(
  client: Client,
  comandaId: string,
  itens: ItemPedidoInput[],
): Promise<{ pedido: Pedido; itens: ItemPedido[] }> {
  return invoke(client, "criar-pedido", { comanda_id: comandaId, itens });
}

/** POST /solicitar-fechamento — token no header global do client. */
export function solicitarFechamento(
  client: Client,
  comandaId: string,
): Promise<Fechamento> {
  return invoke(client, "solicitar-fechamento", { comanda_id: comandaId });
}

/** POST /fechar-conta — usa a sessão do staff logado (JWT via client). */
export function fecharConta(
  client: Client,
  fechamentoId: string,
  formaPagamento: string,
): Promise<Fechamento> {
  return invoke(client, "fechar-conta", {
    fechamento_id: fechamentoId,
    forma_pagamento: formaPagamento,
  });
}
