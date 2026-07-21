import { describe, it, expect } from "vitest";
import {
  alterarQuantidade,
  totalItens,
  itensParaPedido,
  type Carrinho,
} from "./carrinho";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

describe("alterarQuantidade", () => {
  it("adiciona um item novo", () => {
    expect(alterarQuantidade({}, A, 1)).toEqual({ [A]: 1 });
  });

  it("incrementa item existente", () => {
    expect(alterarQuantidade({ [A]: 2 }, A, 1)).toEqual({ [A]: 3 });
  });

  it("remove o item quando a quantidade chega a zero", () => {
    expect(alterarQuantidade({ [A]: 1 }, A, -1)).toEqual({});
  });

  it("nunca deixa a quantidade negativa", () => {
    expect(alterarQuantidade({ [A]: 1 }, A, -5)).toEqual({});
  });

  it("não muta o carrinho original (imutabilidade)", () => {
    const original: Carrinho = { [A]: 1 };
    alterarQuantidade(original, A, 1);
    expect(original).toEqual({ [A]: 1 });
  });
});

describe("totalItens", () => {
  it("soma as quantidades", () => {
    expect(totalItens({ [A]: 2, [B]: 3 })).toBe(5);
  });

  it("é zero para carrinho vazio", () => {
    expect(totalItens({})).toBe(0);
  });
});

describe("itensParaPedido", () => {
  it("converte para o payload de criar-pedido", () => {
    expect(itensParaPedido({ [A]: 2, [B]: 1 })).toEqual([
      { item_cardapio_id: A, quantidade: 2 },
      { item_cardapio_id: B, quantidade: 1 },
    ]);
  });

  it("ignora itens com quantidade zero", () => {
    // (o alterarQuantidade já remove zeros, mas o payload precisa ser robusto)
    expect(itensParaPedido({ [A]: 0, [B]: 2 })).toEqual([
      { item_cardapio_id: B, quantidade: 2 },
    ]);
  });

  it("retorna lista vazia para carrinho vazio", () => {
    expect(itensParaPedido({})).toEqual([]);
  });
});
