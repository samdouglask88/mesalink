"use client";

import { Minus, Plus } from "lucide-react";
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
      <p className="rounded-2xl border border-dashed border-urban-line px-4 py-10 text-center text-sm text-urban-gray">
        Nenhum item disponível no momento.
      </p>
    );
  }

  return (
    <section className="space-y-8">
      <h2 className="font-display text-2xl uppercase text-urban-light">
        Cardápio
      </h2>

      {agrupar(itens).map(([categoria, lista]) => (
        <div key={categoria} className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-urban-primary">
            {categoria}
          </h3>
          <ul className="space-y-3">
            {lista.map((item) => {
              const qtd = carrinho[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-3xl border border-urban-line bg-urban-surface px-5 py-4 transition-colors hover:border-urban-primary/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-urban-light">{item.nome}</p>
                    {item.descricao && (
                      <p className="mt-0.5 truncate text-sm text-urban-muted">
                        {item.descricao}
                      </p>
                    )}
                    {/* Só exibe o preço unitário (dado do backend). Nenhum
                        subtotal é calculado no frontend. */}
                    <p className="mt-1 font-display text-lg text-urban-primary">
                      {formatBRL(item.preco)}
                    </p>
                  </div>

                  {qtd === 0 ? (
                    <button
                      onClick={() => onAlterar(item.id, 1)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-urban-primary px-4 py-2 text-sm font-bold text-urban-bg transition-all hover:bg-urban-primary-600 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  ) : (
                    <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-urban-line bg-urban-bg p-1">
                      <QtdBtn onClick={() => onAlterar(item.id, -1)} label="Diminuir">
                        <Minus className="h-4 w-4" />
                      </QtdBtn>
                      <span className="min-w-6 text-center font-semibold tabular-nums text-urban-light">
                        {qtd}
                      </span>
                      <QtdBtn
                        onClick={() => onAlterar(item.id, 1)}
                        label="Aumentar"
                        destaque
                      >
                        <Plus className="h-4 w-4" />
                      </QtdBtn>
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

function QtdBtn({
  onClick,
  label,
  children,
  destaque = false,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={
        destaque
          ? "grid h-8 w-8 place-items-center rounded-full bg-urban-primary text-urban-bg transition-colors hover:bg-urban-primary-600 active:scale-90"
          : "grid h-8 w-8 place-items-center rounded-full text-urban-light transition-colors hover:bg-urban-elevated active:scale-90"
      }
    >
      {children}
    </button>
  );
}
