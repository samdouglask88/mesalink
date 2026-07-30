"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, X } from "lucide-react";
import { promoBanners } from "@/lib/pedido-data";

export function PromoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-full max-w-lg rounded-t-4xl border border-urban-line bg-urban-bg p-6 shadow-card sm:rounded-4xl"
            role="dialog"
            aria-label="Promoções"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl uppercase text-urban-light">
                🎟️ Promoções
              </h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="grid h-9 w-9 place-items-center rounded-full text-urban-muted transition-colors hover:bg-urban-surface hover:text-urban-light"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex flex-col gap-3">
              {promoBanners.map((p) => (
                <li
                  key={p.cupom}
                  className="rounded-3xl border border-urban-line bg-urban-surface p-4"
                >
                  <h3 className="font-semibold text-urban-light">{p.titulo}</h3>
                  <p className="mt-1 text-sm text-urban-muted">{p.descricao}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="rounded-lg border border-dashed border-urban-primary/60 bg-urban-primary/10 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-urban-primary">
                      {p.cupom}
                    </code>
                    <span className="inline-flex items-center gap-1 text-xs text-urban-muted">
                      <Copy className="h-3.5 w-3.5" /> toque pra copiar
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
