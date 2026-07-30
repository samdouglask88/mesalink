"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Produto } from "@/lib/pedido-data";
import { brl } from "@/lib/pedido-data";
import { useCart } from "./cart-context";

// "Destaques": cartões horizontais roláveis com os produtos em destaque.
export function Highlights({ itens }: { itens: Produto[] }) {
  const { add } = useCart();

  return (
    <section className="pt-6">
      <h2 className="px-4 font-display text-xl uppercase text-urban-light">
        🔥 Destaques
      </h2>
      <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto px-4 pb-2">
        {itens.map((p) => (
          <motion.article
            key={p.id}
            whileHover={{ y: -4 }}
            className="flex w-44 shrink-0 flex-col overflow-hidden rounded-3xl border border-urban-line bg-urban-surface shadow-card"
          >
            <div className="relative h-28 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imagem}
                alt={p.nome}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {p.tag && (
                <span className="absolute left-2 top-2 rounded-full bg-urban-primary px-2 py-0.5 text-[10px] font-bold uppercase text-urban-bg">
                  {p.tag}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-3">
              <h3 className="line-clamp-1 text-sm font-semibold text-urban-light">
                {p.nome}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-urban-muted">
                {p.descricao}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-base text-urban-primary">
                  {brl(p.preco)}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => add(p)}
                  aria-label={`Adicionar ${p.nome}`}
                  className="grid h-8 w-8 place-items-center rounded-full bg-urban-primary text-urban-bg transition-colors hover:bg-urban-primary-600"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
