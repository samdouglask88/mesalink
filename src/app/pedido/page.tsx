import type { Metadata } from "next";
import { PedidoApp } from "@/components/pedido/PedidoApp";

export const metadata: Metadata = {
  title: "Fazer Pedido",
  description:
    "Monte seu pedido no Urban Burger — smash burgers, combos e sobremesas. Entrega rápida.",
};

// Cardápio de pedido (delivery) no formato lista + carrinho local.
export default function PedidoPage() {
  return <PedidoApp />;
}
