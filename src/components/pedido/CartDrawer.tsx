"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag, Trash2, X } from "lucide-react";
import { brl } from "@/lib/pedido-data";
import { useCart } from "./cart-context";
import { QtyStepper } from "./QtyStepper";
import { Button } from "@/components/ui/Button";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { linhas, inc, dec, remove, clear, totalItens, totalValor } = useCart();
  const [enviado, setEnviado] = useState(false);

  const vazio = linhas.length === 0;

  function finalizar() {
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      clear();
      onClose();
    }, 1800);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* painel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-urban-line bg-urban-bg shadow-card"
            role="dialog"
            aria-label="Sua sacola"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-urban-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-xl uppercase text-urban-light">
                <ShoppingBag className="h-5 w-5 text-urban-primary" />
                Sua sacola
              </h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="grid h-9 w-9 place-items-center rounded-full text-urban-muted transition-colors hover:bg-urban-surface hover:text-urban-light"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* corpo */}
            {vazio ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-urban-surface text-3xl">
                  🛒
                </span>
                <p className="font-semibold text-urban-light">
                  Sua sacola está vazia
                </p>
                <p className="text-sm text-urban-muted">
                  Adicione uns burgers insanos e volte aqui.
                </p>
                <Button variant="secondary" onClick={onClose} className="mt-2">
                  Ver cardápio
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ul className="flex flex-col divide-y divide-urban-line">
                  {linhas.map((l) => (
                    <li key={l.produto.id} className="flex gap-3 py-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={l.produto.imagem}
                        alt={l.produto.nome}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-urban-light">
                            {l.produto.nome}
                          </h3>
                          <button
                            onClick={() => remove(l.produto.id)}
                            aria-label={`Remover ${l.produto.nome}`}
                            className="text-urban-gray transition-colors hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm text-urban-primary">
                          {brl(l.produto.preco)}
                        </span>
                        <div className="mt-2 flex items-center justify-between">
                          <QtyStepper
                            qtd={l.qtd}
                            onInc={() => inc(l.produto.id)}
                            onDec={() => dec(l.produto.id)}
                            size="sm"
                          />
                          <span className="text-sm font-semibold tabular-nums text-urban-light">
                            {brl(l.produto.preco * l.qtd)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* rodapé / total */}
            {!vazio && (
              <div className="border-t border-urban-line px-5 py-4">
                <div className="flex items-center justify-between text-sm text-urban-muted">
                  <span>Subtotal ({totalItens} itens)</span>
                  <span className="tabular-nums">{brl(totalValor)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-urban-muted">
                  <span>Entrega</span>
                  <span className="text-emerald-400">Grátis</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-urban-line pt-3">
                  <span className="font-display text-lg uppercase text-urban-light">
                    Total
                  </span>
                  <span className="font-display text-2xl text-urban-primary tabular-nums">
                    {brl(totalValor)}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="mt-4 w-full"
                  onClick={finalizar}
                  disabled={enviado}
                >
                  {enviado ? (
                    <>
                      <Check className="h-5 w-5" /> Pedido enviado!
                    </>
                  ) : (
                    <>Fazer pedido · {brl(totalValor)}</>
                  )}
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
