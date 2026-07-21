// Helpers de EXIBIÇÃO apenas. Nenhuma regra de negócio / cálculo de preço mora
// aqui — totais e preços vêm prontos do backend (Edge Functions / colunas).

/** Formata um número (ou string numérica vinda do Postgres) como BRL. */
export function formatBRL(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n as number) ? (n as number) : 0);
}

/** Hora curta (HH:mm) para carimbar quando um pedido/fechamento chegou. */
export function formatHora(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
