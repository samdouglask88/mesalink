import type { StatusPedido, StatusFechamento } from "@/lib/database.types";

const CORES_PEDIDO: Record<StatusPedido, string> = {
  recebido: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  preparo: "bg-urban-primary/15 text-urban-primary ring-urban-primary/30",
  pronto: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  entregue: "bg-urban-elevated text-urban-muted ring-urban-line",
};

const LABEL_PEDIDO: Record<StatusPedido, string> = {
  recebido: "Recebido",
  preparo: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue",
};

const CORES_FECHAMENTO: Record<StatusFechamento, string> = {
  solicitado: "bg-urban-primary/15 text-urban-primary ring-urban-primary/30",
  avisado: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  fechado: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
};

const LABEL_FECHAMENTO: Record<StatusFechamento, string> = {
  solicitado: "Fechamento solicitado",
  avisado: "Garçom avisado",
  fechado: "Conta fechada",
};

const base =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";

export function BadgePedido({ status }: { status: StatusPedido }) {
  return <span className={`${base} ${CORES_PEDIDO[status]}`}>{LABEL_PEDIDO[status]}</span>;
}

export function BadgeFechamento({ status }: { status: StatusFechamento }) {
  return (
    <span className={`${base} ${CORES_FECHAMENTO[status]}`}>
      {LABEL_FECHAMENTO[status]}
    </span>
  );
}
