"use client";

import { formatHora } from "@/lib/format";
import { BadgePedido } from "@/components/ui/StatusBadge";
import type { Pedido } from "@/lib/database.types";

// Lista os pedidos já enviados desta comanda, com o status atualizado ao vivo
// (o pai reassina/refaz o fetch via realtime).
export default function PedidosAoVivo({ pedidos }: { pedidos: Pedido[] }) {
  if (pedidos.length === 0) return null;

  return (
    <section className="mb-8 space-y-3">
      <h2 className="font-display text-2xl uppercase text-urban-light">
        Seus pedidos
      </h2>
      <ul className="space-y-3">
        {pedidos.map((pedido, i) => (
          <li
            key={pedido.id}
            className="flex items-center justify-between gap-3 rounded-3xl border border-urban-line bg-urban-surface px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-urban-elevated font-display text-sm text-urban-primary">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-urban-light">Pedido #{i + 1}</p>
                <p className="text-xs text-urban-muted">
                  {formatHora(pedido.created_at)}
                </p>
              </div>
            </div>
            <BadgePedido status={pedido.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
