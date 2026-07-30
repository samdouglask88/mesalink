"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { promocoes, brl } from "@/lib/landing-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function Promos() {
  return (
    <section id="promocoes" className="relative py-24 sm:py-32">
      {/* faixa marquee de fundo */}
      <div className="absolute inset-x-0 top-8 -z-10 overflow-hidden opacity-[0.04]">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <span
              key={k}
              className="display-title px-6 text-[10rem] leading-none text-urban-light"
            >
              URBAN BURGER · URBAN BURGER ·
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Promoções"
          title="Ofertas da"
          highlight="quebrada."
          subtitle="Combos pensados pra matar a fome sem esvaziar o bolso."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {promocoes.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-urban-line bg-urban-surface shadow-card"
              >
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imagem}
                    alt={p.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-urban-surface via-urban-surface/40 to-transparent" />
                  <span className="absolute right-4 top-4 rounded-full bg-urban-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-urban-bg">
                    {p.tag}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl uppercase text-urban-light">
                    {p.titulo}
                  </h3>
                  <p className="mt-1 text-sm text-urban-muted">{p.descricao}</p>

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      {p.precoDe && (
                        <span className="block text-sm text-urban-gray line-through">
                          {brl(p.precoDe)}
                        </span>
                      )}
                      <span className="font-display text-3xl text-urban-primary">
                        {brl(p.preco)}
                      </span>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-urban-elevated text-urban-light transition-colors group-hover:bg-urban-primary group-hover:text-urban-bg">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
