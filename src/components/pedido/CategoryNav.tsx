"use client";

import { useEffect, useRef } from "react";
import type { Categoria, CategoriaKey } from "@/lib/pedido-data";
import { cn } from "@/lib/cn";

// Barra de categorias em círculos — gruda no topo ao rolar (sticky) e
// destaca a categoria visível. Clicar rola até a seção.
export function CategoryNav({
  categorias,
  active,
  onSelect,
}: {
  categorias: Categoria[];
  active: CategoriaKey;
  onSelect: (key: CategoriaKey) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Mantém o chip ativo visível na barra horizontal.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  return (
    <div className="sticky top-0 z-30 border-b border-urban-line bg-urban-bg/85 backdrop-blur-xl">
      <div
        ref={scrollerRef}
        className="no-scrollbar mx-auto flex max-w-3xl gap-4 overflow-x-auto px-4 py-3"
      >
        {categorias.map((c) => {
          const isActive = c.key === active;
          return (
            <button
              key={c.key}
              ref={isActive ? activeRef : null}
              onClick={() => onSelect(c.key)}
              className="group flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 transition-all",
                  isActive
                    ? "border-urban-primary shadow-glow-sm"
                    : "border-urban-line group-hover:border-urban-muted",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imagem}
                  alt=""
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-300 group-hover:scale-110",
                    !isActive && "opacity-70 grayscale group-hover:grayscale-0",
                  )}
                />
              </span>
              <span
                className={cn(
                  "line-clamp-1 text-center text-xs font-semibold transition-colors",
                  isActive ? "text-urban-primary" : "text-urban-muted",
                )}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
