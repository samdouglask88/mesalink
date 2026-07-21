"use client";

import { formatHora } from "@/lib/format";
import { BadgePedido } from "@/components/ui/StatusBadge";
import type { Pedido } from "@/lib/database.types";

// Lista os pedidos já enviados desta comanda, com o status atualizado ao vivo
// (o pai reassina/refaz o fetch via realtime).
export default function PedidosAoVivo({ pedidos }: { pedidos: Pedido[] }) {
  if (pedidos.length === 0) return null;

  return (
    <section className="mb-6 space-y-2">
      <h2 className="text-lg font-semibold">Seus pedidos</h2>
      <ul className="space-y-2">
        {pedidos.map((pedido, i) => (
          <li
            key={pedido.id}
            className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
          >
            <div>
              <p className="font-medium">Pedido #{i + 1}</p>
              <p className="text-xs text-neutral-500">
                {formatHora(pedido.created_at)}
              </p>
            </div>
            <BadgePedido status={pedido.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
