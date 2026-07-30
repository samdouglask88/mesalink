"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { avaliacoes } from "@/lib/landing-data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function Reviews() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Avaliações"
          title="Quem prova,"
          highlight="volta."
          subtitle="Mais de 2.400 pedidos e uma galera que não troca a gente por nada."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {avaliacoes.map((a, i) => (
            <Reveal key={a.handle} delay={i * 0.07}>
              <motion.figure
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-full flex-col rounded-4xl border border-urban-line bg-urban-surface p-6 shadow-card"
              >
                <Quote className="h-8 w-8 text-urban-primary/40" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-urban-light">
                  “{a.comentario}”
                </blockquote>
                <div className="mt-5 flex items-center gap-1 text-urban-primary">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-urban-line pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.foto}
                    alt={a.nome}
                    loading="lazy"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-urban-light">
                      {a.nome}
                    </p>
                    <p className="text-xs text-urban-muted">{a.handle}</p>
                  </div>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
