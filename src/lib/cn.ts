// Utilitário mínimo p/ concatenar classes condicionais (sem deps externas).
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
