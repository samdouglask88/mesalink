"use client";

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
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <ul className="mb-3 max-h-40 space-y-1 overflow-y-auto text-sm">
          {linhas.map(([id, q]) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-neutral-300">
                {porId.get(id)?.nome ?? "Item"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAlterar(id, -1)}
                  className="h-6 w-6 rounded border border-neutral-700 leading-none"
                >
                  −
                </button>
                <span className="w-5 text-center tabular-nums">{q}</span>
                <button
                  onClick={() => onAlterar(id, 1)}
                  className="h-6 w-6 rounded border border-neutral-700 leading-none"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={onEnviar}
          disabled={enviando}
          className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-brand-400 disabled:opacity-60"
        >
          {enviando
            ? "Enviando…"
            : `Enviar pedido (${totalItens} ${totalItens === 1 ? "item" : "itens"})`}
        </button>
      </div>
    </div>
  );
}
