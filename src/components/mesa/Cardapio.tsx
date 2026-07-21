"use client";

import { formatBRL } from "@/lib/format";
import type { ItemCardapio } from "@/lib/database.types";

type Props = {
  itens: ItemCardapio[];
  carrinho: Record<string, number>;
  onAlterar: (itemId: string, delta: number) => void;
};

// Agrupa por categoria só para exibição.
function agrupar(itens: ItemCardapio[]) {
  const grupos = new Map<string, ItemCardapio[]>();
  for (const item of itens) {
    const cat = item.categoria ?? "Outros";
    const lista = grupos.get(cat) ?? [];
    lista.push(item);
    grupos.set(cat, lista);
  }
  return [...grupos.entries()];
}

export default function Cardapio({ itens, carrinho, onAlterar }: Props) {
  if (itens.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Nenhum item disponível no momento.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Cardápio</h2>
      {agrupar(itens).map(([categoria, lista]) => (
        <div key={categoria} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {categoria}
          </h3>
          <ul className="space-y-2">
            {lista.map((item) => {
              const qtd = carrinho[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.nome}</p>
                    {item.descricao && (
                      <p className="truncate text-sm text-neutral-400">
                        {item.descricao}
                      </p>
                    )}
                    {/* Só exibe o preço unitário (dado do backend). Nenhum
                        subtotal é calculado no frontend. */}
                    <p className="mt-0.5 text-sm text-brand-400">
                      {formatBRL(item.preco)}
                    </p>
                  </div>

                  {qtd === 0 ? (
                    <button
                      onClick={() => onAlterar(item.id, 1)}
                      className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-neutral-950 transition hover:bg-brand-400"
                    >
                      Adicionar
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <QtdBtn onClick={() => onAlterar(item.id, -1)} label="−" />
                      <span className="w-5 text-center tabular-nums">{qtd}</span>
                      <QtdBtn onClick={() => onAlterar(item.id, 1)} label="+" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}

function QtdBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="h-8 w-8 rounded-lg border border-neutral-700 text-lg leading-none transition hover:border-brand-500"
    >
      {label}
    </button>
  );
}
