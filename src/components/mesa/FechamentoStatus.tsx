"use client";

import { formatBRL } from "@/lib/format";
import { BadgeFechamento } from "@/components/ui/StatusBadge";
import type { Fechamento } from "@/lib/database.types";

const TEXTO: Record<Fechamento["status"], string> = {
  solicitado: "Pedimos o fechamento. Aguarde o garçom.",
  avisado: "O garçom foi avisado e já está a caminho.",
  fechado: "Conta paga. Obrigado pela visita! 🍔",
};

// Acompanhamento da conta em tempo real (o total vem pronto do backend).
export default function FechamentoStatus({
  fechamento,
}: {
  fechamento: Fechamento;
}) {
  return (
    <section className="mb-8 overflow-hidden rounded-4xl border border-urban-primary/30 bg-gradient-to-br from-urban-primary/10 via-urban-surface to-urban-surface p-6 shadow-glow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl uppercase text-urban-light">
          Sua conta
        </h2>
        <BadgeFechamento status={fechamento.status} />
      </div>
      <p className="text-sm text-urban-muted">{TEXTO[fechamento.status]}</p>
      <p className="mt-4 font-display text-5xl text-urban-primary tabular-nums">
        {formatBRL(fechamento.total)}
      </p>
    </section>
  );
}
