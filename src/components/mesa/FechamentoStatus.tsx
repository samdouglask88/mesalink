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
    <section className="mb-6 rounded-xl border border-brand-500/30 bg-brand-500/5 px-4 py-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conta</h2>
        <BadgeFechamento status={fechamento.status} />
      </div>
      <p className="text-sm text-neutral-300">{TEXTO[fechamento.status]}</p>
      <p className="mt-3 text-2xl font-bold text-brand-400">
        {formatBRL(fechamento.total)}
      </p>
    </section>
  );
}
