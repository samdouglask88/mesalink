// Lógica pura do carrinho local do cliente (sem I/O, sem preço). Fica separada
// do componente para ser facilmente testável. NENHUM cálculo de valor mora aqui
// — só quantidades; preços/total são responsabilidade do backend.
import type { ItemPedidoInput } from "@/lib/edge";

// carrinho: item_cardapio_id -> quantidade.
export type Carrinho = Record<string, number>;

/** Soma/subtrai `delta` na quantidade de um item, sem deixar negativar. */
export function alterarQuantidade(
  carrinho: Carrinho,
  itemId: string,
  delta: number,
): Carrinho {
  const nova = Math.max(0, (carrinho[itemId] ?? 0) + delta);
  const copia = { ...carrinho };
  if (nova === 0) delete copia[itemId];
  else copia[itemId] = nova;
  return copia;
}

/** Total de itens (soma das quantidades) — usado só para exibição/contagem. */
export function totalItens(carrinho: Carrinho): number {
  return Object.values(carrinho).reduce((soma, q) => soma + q, 0);
}

/** Converte o carrinho no payload de `criar-pedido` (só itens com qtd > 0). */
export function itensParaPedido(carrinho: Carrinho): ItemPedidoInput[] {
  return Object.entries(carrinho)
    .filter(([, q]) => q > 0)
    .map(([item_cardapio_id, quantidade]) => ({ item_cardapio_id, quantidade }));
}
