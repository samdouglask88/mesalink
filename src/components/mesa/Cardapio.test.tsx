import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Cardapio from "./Cardapio";
import type { ItemCardapio } from "@/lib/database.types";

const item = (over: Partial<ItemCardapio>): ItemCardapio => ({
  id: "i1",
  nome: "Classic Burger",
  descricao: "Pão, hambúrguer, queijo",
  preco: 28,
  categoria: "burgers",
  disponivel: true,
  created_at: "",
  ...over,
});

const BURGER = item({ id: "i1", nome: "Classic Burger", categoria: "burgers" });
const BATATA = item({
  id: "i2",
  nome: "Batata Frita",
  categoria: "acompanhamentos",
  preco: 16,
});

describe("Cardapio", () => {
  it("mostra os itens agrupados por categoria", () => {
    render(<Cardapio itens={[BURGER, BATATA]} carrinho={{}} onAlterar={() => {}} />);
    expect(screen.getByText("Classic Burger")).toBeInTheDocument();
    expect(screen.getByText("Batata Frita")).toBeInTheDocument();
    expect(screen.getByText("burgers")).toBeInTheDocument();
    expect(screen.getByText("acompanhamentos")).toBeInTheDocument();
  });

  it("mostra o botão de adicionar quando o item não está no carrinho e dispara onAlterar(+1)", () => {
    const onAlterar = vi.fn();
    render(<Cardapio itens={[BURGER]} carrinho={{}} onAlterar={onAlterar} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(onAlterar).toHaveBeenCalledWith("i1", 1);
  });

  it("mostra a quantidade e os controles +/- quando o item está no carrinho", () => {
    const onAlterar = vi.fn();
    render(<Cardapio itens={[BURGER]} carrinho={{ i1: 2 }} onAlterar={onAlterar} />);
    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aumentar" }));
    expect(onAlterar).toHaveBeenCalledWith("i1", 1);

    fireEvent.click(screen.getByRole("button", { name: "Diminuir" }));
    expect(onAlterar).toHaveBeenCalledWith("i1", -1);
  });

  it("mostra aviso quando não há itens disponíveis", () => {
    render(<Cardapio itens={[]} carrinho={{}} onAlterar={() => {}} />);
    expect(screen.getByText(/nenhum item disponível/i)).toBeInTheDocument();
  });
});
