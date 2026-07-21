"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fecharConta, mensagemDoErro } from "@/lib/edge";
import { formatBRL, formatHora } from "@/lib/format";
import { BadgeFechamento } from "@/components/ui/StatusBadge";
import StaffHeader from "@/components/staff/StaffHeader";
import type { Fechamento, FormaPagamento } from "@/lib/database.types";

// Fechamento com a mesa aninhada, só para exibição.
type FechamentoCaixa = Fechamento & {
  comandas: { mesas: { numero: number } | null } | null;
};

const FORMAS: { valor: FormaPagamento; label: string }[] = [
  { valor: "dinheiro", label: "Dinheiro" },
  { valor: "credito", label: "Crédito" },
  { valor: "debito", label: "Débito" },
  { valor: "pix", label: "Pix" },
];

export default function CaixaDashboard({ nome }: { nome: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [fechamentos, setFechamentos] = useState<FechamentoCaixa[]>([]);
  // forma de pagamento escolhida por fechamento (antes de confirmar).
  const [formas, setFormas] = useState<Record<string, FormaPagamento>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("fechamentos")
      .select("*, comandas(mesas(numero))")
      .in("status", ["solicitado", "avisado"])
      .order("solicitado_em", { ascending: true });

    if (error) {
      setErro(error.message);
      return;
    }
    setFechamentos((data ?? []) as unknown as FechamentoCaixa[]);
  }, [supabase]);

  useEffect(() => {
    refetch();

    const channel = supabase
      .channel("caixa-fechamentos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fechamentos" },
        () => refetch(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refetch]);

  // Avisar garçom: update direto status = 'avisado' (RLS do caixa permite).
  async function avisarGarcom(id: string) {
    setOcupado(id);
    setErro(null);
    const { error } = await supabase
      .from("fechamentos")
      .update({ status: "avisado" })
      .eq("id", id);
    if (error) setErro(error.message);
    else refetch();
    setOcupado(null);
  }

  // Confirmar pagamento: via Edge Function fechar-conta (usa o JWT do caixa).
  async function confirmarPagamento(id: string) {
    const forma = formas[id];
    if (!forma) {
      setErro("Selecione a forma de pagamento.");
      return;
    }
    setOcupado(id);
    setErro(null);
    try {
      await fecharConta(supabase, id, forma);
      // Após fechar, o registro sai da lista (status vira 'fechado').
      refetch();
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setOcupado(null);
    }
  }

  return (
    <>
      <StaffHeader titulo="Caixa" nome={nome} />

      {erro && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {erro}
        </div>
      )}

      {fechamentos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-800 px-4 py-10 text-center text-sm text-neutral-600">
          Nenhuma conta aguardando fechamento.
        </p>
      ) : (
        <ul className="space-y-4">
          {fechamentos.map((f) => {
            const mesa = f.comandas?.mesas?.numero;
            const trabalhando = ocupado === f.id;
            return (
              <li
                key={f.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">
                      {mesa != null ? `Mesa ${mesa}` : "Conta"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      solicitado às {formatHora(f.solicitado_em)}
                    </p>
                  </div>
                  <div className="text-right">
                    <BadgeFechamento status={f.status} />
                    <p className="mt-1 text-xl font-bold text-brand-400">
                      {formatBRL(f.total)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {f.status === "solicitado" && (
                    <button
                      onClick={() => avisarGarcom(f.id)}
                      disabled={trabalhando}
                      className="rounded-lg border border-neutral-700 px-3 py-2 text-sm transition hover:border-brand-500 disabled:opacity-60"
                    >
                      Avisar garçom
                    </button>
                  )}

                  <select
                    value={formas[f.id] ?? ""}
                    onChange={(e) =>
                      setFormas((s) => ({
                        ...s,
                        [f.id]: e.target.value as FormaPagamento,
                      }))
                    }
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
                  >
                    <option value="" disabled>
                      Forma de pagamento…
                    </option>
                    {FORMAS.map((fp) => (
                      <option key={fp.valor} value={fp.valor}>
                        {fp.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => confirmarPagamento(f.id)}
                    disabled={trabalhando}
                    className="ml-auto rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-brand-400 disabled:opacity-60"
                  >
                    {trabalhando ? "…" : "Confirmar pagamento"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
