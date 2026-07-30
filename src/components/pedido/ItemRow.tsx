"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Produto } from "@/lib/pedido-data";
import { brl } from "@/lib/pedido-data";
import { useCart } from "./cart-context";
import { QtyStepper } from "./QtyStepper";

// Linha de produto no cardápio: texto à esquerda, foto + controle à direita.
export function ItemRow({ produto }: { produto: Produto }) {
  const { qtdDe, add, inc, dec } = useCart();
  const qtd = qtdDe(produto.id);

  return (
    <div className="flex items-stretch gap-4 py-5">
      {/* Texto */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-urban-light">{produto.nome}</h3>
          {produto.tag && (
            <span className="rounded-full bg-urban-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-urban-primary">
              {produto.tag}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-urban-muted">
          {produto.descricao}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-display text-lg text-urban-primary">
            {brl(produto.preco)}
          </span>
          {produto.precoDe && (
            <span className="text-sm text-urban-gray line-through">
              {brl(produto.precoDe)}
            </span>
          )}
        </div>
      </div>

      {/* Foto + controle */}
      <div className="relative h-28 w-28 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={produto.imagem}
          alt={produto.nome}
          loading="lazy"
          className="h-full w-full rounded-2xl object-cover"
        />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          {qtd === 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => add(produto)}
              aria-label={`Adicionar ${produto.nome}`}
              className="inline-flex items-center gap-1 rounded-full bg-urban-primary px-4 py-2 text-sm font-bold text-urban-bg shadow-glow-sm transition-colors hover:bg-urban-primary-600"
            >
              <Plus className="h-4 w-4" /> Add
            </motion.button>
          ) : (
            <QtyStepper
              qtd={qtd}
              onInc={() => inc(produto.id)}
              onDec={() => dec(produto.id)}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
