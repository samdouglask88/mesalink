"use client";

import { Minus, Plus, Send } from "lucide-react";
import type { ItemCardapio } from "@/lib/database.types";

type Props = {
  itens: ItemCardapio[];
  carrinho: Record<string, number>;
  totalItens: number;
  enviando: boolean;
  onAlterar: (itemId: string, delta: number) => void;
  onEnviar: () => void;
};

// Barra fixa no rodapé com o resumo do carrinho e o botão "enviar pedido".
// Mostra itens e quantidades — NÃO calcula preço total (isso é do backend).
export default function Carrinho({
  itens,
  carrinho,
  totalItens,
  enviando,
  onAlterar,
  onEnviar,
}: Props) {
  if (totalItens === 0) return null;

  const porId = new Map(itens.map((i) => [i.id, i]));
  const linhas = Object.entries(carrinho).filter(([, q]) => q > 0);

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-urban-line bg-urban-bg/95 backdrop-blur-xl">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <ul className="no-scrollbar mb-4 max-h-40 space-y-2 overflow-y-auto">
          {linhas.map(([id, q]) => (
            <li key={id} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-sm text-urban-light">
                {porId.get(id)?.nome ?? "Item"}
              </span>
              <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-urban-line bg-urban-surface p-1">
                <button
                  onClick={() => onAlterar(id, -1)}
                  aria-label="Diminuir"
                  className="grid h-7 w-7 place-items-center rounded-full text-urban-light transition-colors hover:bg-urban-elevated active:scale-90"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-5 text-center text-sm font-semibold tabular-nums text-urban-light">
                  {q}
                </span>
                <button
                  onClick={() => onAlterar(id, 1)}
                  aria-label="Aumentar"
                  className="grid h-7 w-7 place-items-center rounded-full bg-urban-primary text-urban-bg transition-colors hover:bg-urban-primary-600 active:scale-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={onEnviar}
          disabled={enviando}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-urban-primary px-4 py-3.5 font-bold text-urban-bg shadow-glow-sm transition-all hover:bg-urban-primary-600 hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {enviando
            ? "Enviando…"
            : `Enviar pedido (${totalItens} ${totalItens === 1 ? "item" : "itens"})`}
        </button>
      </div>
    </div>
  );
}
