"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChefHat, Check, Flame, Inbox } from "lucide-react";
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
const COLUNAS: {
  status: StatusPedido;
  titulo: string;
  icone: typeof Inbox;
  cor: string;
}[] = [
  { status: "recebido", titulo: "Recebidos", icone: Inbox, cor: "text-sky-400" },
  { status: "preparo", titulo: "Em preparo", icone: Flame, cor: "text-urban-primary" },
  { status: "pronto", titulo: "Prontos", icone: Check, cor: "text-emerald-400" },
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
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {COLUNAS.map((coluna) => {
          const daColuna = pedidos.filter((p) => p.status === coluna.status);
          const Icone = coluna.icone;
          return (
            <section key={coluna.status} className="flex flex-col gap-3">
              <header className="flex items-center justify-between rounded-2xl border border-urban-line bg-urban-surface px-4 py-3">
                <h2 className="flex items-center gap-2 font-display text-lg uppercase text-urban-light">
                  <Icone className={`h-5 w-5 ${coluna.cor}`} />
                  {coluna.titulo}
                </h2>
                <span className="grid h-7 min-w-7 place-items-center rounded-full bg-urban-elevated px-2 text-sm font-bold tabular-nums text-urban-light">
                  {daColuna.length}
                </span>
              </header>

              {daColuna.length === 0 && (
                <p className="rounded-2xl border border-dashed border-urban-line px-3 py-10 text-center text-sm text-urban-gray">
                  Nada por aqui
                </p>
              )}

              {daColuna.map((pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-3xl border border-urban-line bg-urban-surface p-5 shadow-card transition-all hover:border-urban-primary/40 hover:shadow-card-hover"
                >
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-urban-muted">
                    <ChefHat className="h-3.5 w-3.5" />
                    {formatHora(pedido.created_at)}
                  </p>
                  <ul className="mb-4 space-y-2">
                    {pedido.itens_pedido.map((it, idx) => (
                      <li key={idx} className="flex items-baseline gap-2.5">
                        <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-lg bg-urban-primary px-1.5 text-xs font-bold tabular-nums text-urban-bg">
                          {it.quantidade}
                        </span>
                        <span className="text-urban-light">
                          {it.itens_cardapio?.nome ?? "Item"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => avancar(pedido.id, pedido.status)}
                    className="w-full rounded-full bg-urban-primary px-4 py-2.5 text-sm font-bold text-urban-bg transition-all hover:bg-urban-primary-600 active:scale-[0.98]"
                  >
                    {pedido.status !== "entregue" && PROXIMO[pedido.status].label}
                  </button>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
