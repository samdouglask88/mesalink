"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Home, ShoppingBag, Tag } from "lucide-react";
import { brl } from "@/lib/pedido-data";
import { useCart } from "./cart-context";
import { cn } from "@/lib/cn";

// Barra inferior + resumo flutuante da sacola (aparece quando há itens).
export function BottomBar({
  onOpenCart,
  onOpenPromos,
}: {
  onOpenCart: () => void;
  onOpenPromos: () => void;
}) {
  const { totalItens, totalValor } = useCart();

  return (
    <>
      {/* Resumo da sacola (flutua acima da barra) */}
      <AnimatePresence>
        {totalItens > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-[4.5rem] z-40 px-4"
          >
            <button
              onClick={onOpenCart}
              className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-full bg-urban-primary px-5 py-3.5 text-urban-bg shadow-glow transition-colors hover:bg-urban-primary-600"
            >
              <span className="flex items-center gap-2 font-bold">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-urban-bg/20 text-sm tabular-nums">
                  {totalItens}
                </span>
                Ver sacola
              </span>
              <span className="font-display text-lg tabular-nums">
                {brl(totalValor)}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de navegação */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-urban-line bg-urban-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2 py-2">
          <Tab href="/" icon={<Home className="h-5 w-5" />} label="Início" />
          <Tab
            onClick={onOpenPromos}
            icon={<Tag className="h-5 w-5" />}
            label="Promoções"
          />
          <Tab
            onClick={onOpenCart}
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Sacola"
            badge={totalItens}
          />
        </div>
      </nav>
    </>
  );
}

function Tab({
  href,
  onClick,
  icon,
  label,
  badge,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  const inner = (
    <span className="relative flex flex-col items-center gap-1 px-4 py-1 text-urban-muted transition-colors hover:text-urban-light">
      <span className="relative">
        {icon}
        {badge ? (
          <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-urban-primary px-1 text-[10px] font-bold text-urban-bg tabular-nums">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex")}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className="flex">
      {inner}
    </button>
  );
}
