"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Star, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GraffitiBackground } from "./GraffitiBackground";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16"
    >
      <GraffitiBackground />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
        {/* Lado esquerdo */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span
            variants={item}
            className="eyebrow mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-urban-primary" />
            Hamburgueria artesanal · desde 2019
          </motion.span>

          <motion.h1
            variants={item}
            className="display-title text-balance text-5xl text-urban-light sm:text-6xl md:text-7xl"
          >
            Os burgers mais{" "}
            <span className="relative inline-block text-urban-primary">
              insanos
              <svg
                className="absolute -bottom-2 left-0 w-full text-urban-primary"
                viewBox="0 0 200 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8c40-6 156-6 196 0"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            da cidade.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-md text-lg text-urban-muted"
          >
            Pão artesanal, ingredientes selecionados e muito sabor. Feito na
            chapa, com alma de rua.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={() => (window.location.href = "/pedido")}
            >
              Pedir agora <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => (window.location.hash = "#cardapio")}
            >
              <UtensilsCrossed className="h-4 w-4" /> Ver cardápio
            </Button>
          </motion.div>

          {/* Prova social */}
          <motion.div
            variants={item}
            className="mt-10 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[12, 45, 15, 32].map((n) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={n}
                  src={`https://i.pravatar.cc/80?img=${n}`}
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-urban-bg object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-urban-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-urban-muted">
                <span className="font-semibold text-urban-light">+2.400</span>{" "}
                clientes satisfeitos
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Lado direito — imagem premium flutuante */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative mx-auto w-full max-w-md lg:max-w-lg"
        >
          <div className="absolute inset-0 -z-10 scale-90 rounded-full bg-urban-primary/25 blur-3xl" />
          <div className="animate-float">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85"
              alt="Hambúrguer artesanal premium da Urban Burger"
              className="aspect-square w-full rounded-4xl object-cover shadow-card"
            />
          </div>

          {/* selo flutuante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-card sm:-left-8"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-urban-primary text-xl">
              🔥
            </span>
            <div>
              <p className="text-sm font-semibold text-urban-light">
                Feito na hora
              </p>
              <p className="text-xs text-urban-muted">Chapa a 250°C</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
