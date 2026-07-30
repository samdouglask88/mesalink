"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu as MenuIcon, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const links = [
  { label: "Home", href: "#home" },
  { label: "Cardápio", href: "#cardapio" },
  { label: "Promoções", href: "#promocoes" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 transition-all duration-300 sm:px-6",
          scrolled
            ? "mt-2 rounded-full border border-urban-line/80 bg-urban-bg/80 px-4 py-2.5 shadow-card backdrop-blur-xl sm:mx-4 lg:mx-auto lg:max-w-6xl"
            : "border border-transparent",
        )}
      >
        <a href="#home" aria-label="Urban Burger — início">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-urban-muted transition-colors hover:bg-urban-surface hover:text-urban-light"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button size="md" onClick={() => (window.location.href = "/pedido")}>
            Fazer Pedido
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-urban-line bg-urban-surface text-urban-light lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mt-2 overflow-hidden rounded-3xl border border-urban-line bg-urban-bg/95 p-4 shadow-card backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-urban-muted transition-colors hover:bg-urban-surface hover:text-urban-light"
                >
                  {l.label}
                </a>
              ))}
              <Button
                className="mt-2 w-full"
                size="lg"
                onClick={() => {
                  setOpen(false);
                  window.location.href = "/pedido";
                }}
              >
                Fazer Pedido
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
