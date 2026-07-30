"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

// Controle +/- de quantidade. Usado no card do item e no carrinho.
export function QtyStepper({
  qtd,
  onInc,
  onDec,
  size = "md",
}: {
  qtd: number;
  onInc: () => void;
  onDec: () => void;
  size?: "sm" | "md";
}) {
  const btn =
    size === "sm"
      ? "h-7 w-7"
      : "h-9 w-9";
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-urban-line bg-urban-bg p-1">
      <button
        onClick={onDec}
        aria-label="Diminuir"
        className={cn(
          "grid place-items-center rounded-full text-urban-light transition-colors hover:bg-urban-elevated active:scale-90",
          btn,
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "min-w-6 text-center font-semibold tabular-nums text-urban-light",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {qtd}
      </span>
      <button
        onClick={onInc}
        aria-label="Aumentar"
        className={cn(
          "grid place-items-center rounded-full bg-urban-primary text-urban-bg transition-colors hover:bg-urban-primary-600 active:scale-90",
          btn,
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
