"use client";

import { motion } from "framer-motion";
import { diferenciais } from "@/lib/landing-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function Features() {
  return (
    <section id="sobre" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          {/* Texto sobre */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Sobre nós"
              title="Comida de rua com"
              highlight="acabamento premium."
              subtitle="Nascemos numa esquina em 2019 com uma chapa, uma ideia e muito respeito pelo hambúrguer. Hoje seguimos com a mesma pegada: ingrediente de verdade, ponto certo e nenhuma frescura desnecessária."
            />
          </div>

          {/* Grid de diferenciais */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {diferenciais.map((d, i) => (
              <Reveal key={d.titulo} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group h-full rounded-3xl border border-urban-line bg-urban-surface p-6 shadow-card transition-colors hover:border-urban-primary/40"
                >
                  <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-urban-primary/12 text-urban-primary transition-colors group-hover:bg-urban-primary group-hover:text-urban-bg">
                    <d.icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-lg uppercase text-urban-light">
                    {d.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-urban-muted">
                    {d.descricao}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
