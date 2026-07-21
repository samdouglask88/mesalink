"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatHora } from "@/lib/format";
import StaffHeader from "@/components/staff/StaffHeader";
import type { StatusPedido } from "@/lib/database.types";

// Formato do pedido com os itens aninhados (para a cozinha saber o que preparar).
type PedidoCozinha = {
  id: string;
  status: StatusPedido;
  created_at: string;
  itens_pedido: {
    quantidade: number;
    itens_cardapio: { nome: string } | null;
  }[];
};

// A cozinha só lida com estas colunas — 'entregue' nunca aparece aqui.
const COLUNAS: { status: StatusPedido; titulo: string }[] = [
  { status: "recebido", titulo: "Recebidos" },
  { status: "preparo", titulo: "Em preparo" },
  { status: "pronto", titulo: "Prontos" },
];

// Próximo status ao clicar em "avançar".
const PROXIMO: Record<
  Exclude<StatusPedido, "entregue">,
  { alvo: StatusPedido; label: string }
> = {
  recebido: { alvo: "preparo", label: "Iniciar preparo" },
  preparo: { alvo: "pronto", label: "Marcar pronto" },
  pronto: { alvo: "entregue", label: "Marcar entregue" },
};

export default function CozinhaDashboard({ nome }: { nome: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [pedidos, setPedidos] = useState<PedidoCozinha[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select(
        "id, status, created_at, itens_pedido(quantidade, itens_cardapio(nome))",
      )
      .in("status", ["recebido", "preparo", "pronto"])
      .order("created_at", { ascending: true });

    if (error) {
      setErro(error.message);
      return;
    }
    setPedidos((data ?? []) as PedidoCozinha[]);
  }, [supabase]);

  useEffect(() => {
    refetch();

    const channel = supabase
      .channel("cozinha-pedidos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => refetch(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refetch]);

  async function avancar(id: string, statusAtual: StatusPedido) {
    if (statusAtual === "entregue") return;
    const { alvo } = PROXIMO[statusAtual];

    // Update direto (protegido pela RLS + trigger de coluna do backend).
    const { error } = await supabase
      .from("pedidos")
      .update({ status: alvo })
      .eq("id", id);

    if (error) {
      setErro(error.message);
      return;
    }
    // O realtime já reflete a mudança; refetch garante consistência imediata.
    refetch();
  }

  return (
    <>
      <StaffHeader titulo="Cozinha" nome={nome} />

      {erro && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {erro}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {COLUNAS.map((coluna) => {
          const daColuna = pedidos.filter((p) => p.status === coluna.status);
          return (
            <div key={coluna.status} className="space-y-3">
              <h2 className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-neutral-400">
                {coluna.titulo}
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs tabular-nums">
                  {daColuna.length}
                </span>
              </h2>

              {daColuna.length === 0 && (
                <p className="rounded-lg border border-dashed border-neutral-800 px-3 py-6 text-center text-xs text-neutral-600">
                  vazio
                </p>
              )}

              {daColuna.map((pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
                >
                  <p className="mb-2 text-xs text-neutral-500">
                    {formatHora(pedido.created_at)}
                  </p>
                  <ul className="mb-3 space-y-1 text-sm">
                    {pedido.itens_pedido.map((it, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-semibold text-brand-400">
                          {it.quantidade}×
                        </span>
                        <span>{it.itens_cardapio?.nome ?? "Item"}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => avancar(pedido.id, pedido.status)}
                    className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-brand-400"
                  >
                    {pedido.status !== "entregue" && PROXIMO[pedido.status].label}
                  </button>
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
