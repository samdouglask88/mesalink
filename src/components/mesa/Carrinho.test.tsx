import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Carrinho from "./Carrinho";
import type { ItemCardapio } from "@/lib/database.types";

const ITENS: ItemCardapio[] = [
  {
    id: "i1",
    nome: "Classic Burger",
    descricao: null,
    preco: 28,
    categoria: "burgers",
    disponivel: true,
    created_at: "",
  },
];

const noop = () => {};

describe("Carrinho", () => {
  it("não renderiza nada quando está vazio", () => {
    const { container } = render(
      <Carrinho
        itens={ITENS}
        carrinho={{}}
        totalItens={0}
        enviando={false}
        onAlterar={noop}
        onEnviar={noop}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o botão de enviar com a contagem e dispara onEnviar", () => {
    const onEnviar = vi.fn();
    render(
      <Carrinho
        itens={ITENS}
        carrinho={{ i1: 3 }}
        totalItens={3}
        enviando={false}
        onAlterar={noop}
        onEnviar={onEnviar}
      />,
    );
    const botao = screen.getByRole("button", { name: /enviar pedido \(3 itens\)/i });
    fireEvent.click(botao);
    expect(onEnviar).toHaveBeenCalledOnce();
  });

  it("usa singular para 1 item", () => {
    render(
      <Carrinho
        itens={ITENS}
        carrinho={{ i1: 1 }}
        totalItens={1}
        enviando={false}
        onAlterar={noop}
        onEnviar={noop}
      />,
    );
    expect(
      screen.getByRole("button", { name: /enviar pedido \(1 item\)/i }),
    ).toBeInTheDocument();
  });

  it("desabilita o botão enquanto envia", () => {
    render(
      <Carrinho
        itens={ITENS}
        carrinho={{ i1: 1 }}
        totalItens={1}
        enviando={true}
        onAlterar={noop}
        onEnviar={noop}
      />,
    );
    expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled();
  });
});
