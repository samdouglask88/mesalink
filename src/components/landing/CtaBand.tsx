"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-4xl border border-urban-primary/30 bg-gradient-to-br from-urban-primary/15 via-urban-surface to-urban-surface p-10 shadow-glow-sm sm:p-16">
        <div className="absolute inset-0 -z-10 bg-grain opacity-[0.05]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-urban-primary/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 className="display-title text-balance text-4xl text-urban-light sm:text-5xl">
              Bateu a fome?{" "}
              <span className="text-urban-primary">A gente resolve.</span>
            </h2>
            <p className="mt-3 max-w-md text-urban-muted">
              Peça agora e receba quentinho em até 30 minutos.
            </p>
          </div>
          <a href="/pedido">
            <Button size="lg" className="whitespace-nowrap">
              Pedir agora <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
