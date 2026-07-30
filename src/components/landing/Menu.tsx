"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Flame } from "lucide-react";
import {
  categorias,
  menu,
  brl,
  type MenuCategory,
  type MenuItem,
} from "@/lib/landing-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

export function Menu() {
  const [cat, setCat] = useState<MenuCategory>("smash");

  const itens = useMemo(
    () => menu.filter((m) => m.categoria === cat),
    [cat],
  );

  return (
    <section id="cardapio" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Cardápio"
          title="Escolha seu"
          highlight="veneno."
          subtitle="Do smash clássico às sobremesas de rua. Tudo feito na hora, do nosso jeito."
        />

        {/* Abas de categoria */}
        <div className="no-scrollbar mt-10 flex justify-start gap-2 overflow-x-auto pb-2 sm:justify-center">
          {categorias.map((c) => {
            const active = c.key === cat;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={cn(
                  "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "text-urban-bg"
                    : "text-urban-muted hover:text-urban-light",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-urban-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="mr-1.5">{c.emoji}</span>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Grid de produtos */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {itens.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const [added, setAdded] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-4xl border border-urban-line bg-urban-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-urban-primary/40 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imagem}
          alt={item.nome}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-urban-surface via-transparent to-transparent" />
        {item.destaque && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-urban-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-urban-bg">
            <Flame className="h-3.5 w-3.5" /> Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl uppercase leading-tight text-urban-light">
            {item.nome}
          </h3>
          <span className="shrink-0 font-display text-lg text-urban-primary">
            {brl(item.preco)}
          </span>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-urban-muted">
          {item.descricao}
        </p>

        <button
          onClick={() => {
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
          }}
          className={cn(
            "mt-5 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-95",
            added
              ? "bg-emerald-500 text-white"
              : "bg-urban-elevated text-urban-light hover:bg-urban-primary hover:text-urban-bg",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="ok"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="h-4 w-4" /> Adicionado
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Adicionar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.article>
  );
}
