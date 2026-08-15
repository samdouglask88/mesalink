"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  BellRing,
  CreditCard,
  QrCode,
  Receipt,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fecharConta, mensagemDoErro } from "@/lib/edge";
import { formatBRL, formatHora } from "@/lib/format";
import { BadgeFechamento } from "@/components/ui/StatusBadge";
import StaffHeader from "@/components/staff/StaffHeader";
import { cn } from "@/lib/cn";
import type { Fechamento, FormaPagamento } from "@/lib/database.types";

// Fechamento com a mesa aninhada, só para exibição.
type FechamentoCaixa = Fechamento & {
  comandas: { mesas: { numero: number } | null } | null;
};

const FORMAS: { valor: FormaPagamento; label: string; icone: typeof Wallet }[] = [
  { valor: "dinheiro", label: "Dinheiro", icone: Banknote },
  { valor: "credito", label: "Crédito", icone: CreditCard },
  { valor: "debito", label: "Débito", icone: Wallet },
  { valor: "pix", label: "Pix", icone: QrCode },
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
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      {fechamentos.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-urban-line px-6 py-16 text-center">
          <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-urban-surface">
            <Receipt className="h-7 w-7 text-urban-gray" />
          </span>
          <p className="font-semibold text-urban-light">Tudo em dia</p>
          <p className="mt-1 text-sm text-urban-muted">
            Nenhuma conta aguardando fechamento.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 lg:grid-cols-2">
          {fechamentos.map((f) => {
            const mesa = f.comandas?.mesas?.numero;
            const trabalhando = ocupado === f.id;
            const formaEscolhida = formas[f.id];
            return (
              <li
                key={f.id}
                className="flex flex-col rounded-4xl border border-urban-line bg-urban-surface p-6 shadow-card"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl uppercase leading-none text-urban-light">
                      {mesa != null ? `Mesa ${mesa}` : "Conta"}
                    </h2>
                    <p className="mt-1.5 text-xs text-urban-muted">
                      solicitado às {formatHora(f.solicitado_em)}
                    </p>
                  </div>
                  <div className="text-right">
                    <BadgeFechamento status={f.status} />
                    <p className="mt-2 font-display text-3xl text-urban-primary tabular-nums">
                      {formatBRL(f.total)}
                    </p>
                  </div>
                </div>

                {/* Formas de pagamento */}
                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {FORMAS.map((fp) => {
                    const Icone = fp.icone;
                    const ativa = formaEscolhida === fp.valor;
                    return (
                      <button
                        key={fp.valor}
                        onClick={() =>
                          setFormas((s) => ({ ...s, [f.id]: fp.valor }))
                        }
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-semibold transition-all",
                          ativa
                            ? "border-urban-primary bg-urban-primary/10 text-urban-primary"
                            : "border-urban-line bg-urban-bg text-urban-muted hover:border-urban-muted hover:text-urban-light",
                        )}
                      >
                        <Icone className="h-5 w-5" />
                        {fp.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  {f.status === "solicitado" && (
                    <button
                      onClick={() => avisarGarcom(f.id)}
                      disabled={trabalhando}
                      className="inline-flex items-center gap-2 rounded-full border border-urban-line bg-urban-bg px-4 py-2.5 text-sm font-semibold text-urban-light transition-colors hover:border-urban-primary hover:text-urban-primary disabled:opacity-60"
                    >
                      <BellRing className="h-4 w-4" />
                      Avisar garçom
                    </button>
                  )}

                  <button
                    onClick={() => confirmarPagamento(f.id)}
                    disabled={trabalhando}
                    className="ml-auto rounded-full bg-urban-primary px-5 py-2.5 text-sm font-bold text-urban-bg shadow-glow-sm transition-all hover:bg-urban-primary-600 hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
                  >
                    {trabalhando ? "Processando…" : "Confirmar pagamento"}
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
