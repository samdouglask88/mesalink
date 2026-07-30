"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  categorias,
  produtos,
  type CategoriaKey,
} from "@/lib/pedido-data";
import { CartProvider } from "./cart-context";
import { RestaurantHeader } from "./RestaurantHeader";
import { CategoryNav } from "./CategoryNav";
import { Highlights } from "./Highlights";
import { ItemRow } from "./ItemRow";
import { CartDrawer } from "./CartDrawer";
import { PromoModal } from "./PromoModal";
import { BottomBar } from "./BottomBar";

const STICKY_OFFSET = 110; // altura aproximada da barra de categorias fixa

export function PedidoApp() {
  const [cartOpen, setCartOpen] = useState(false);
  const [promosOpen, setPromosOpen] = useState(false);
  const [active, setActive] = useState<CategoriaKey>("destaques");

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const travaScroll = useRef(false);

  const destaques = useMemo(() => produtos.filter((p) => p.destaque), []);

  // Categorias que têm itens, na ordem definida (destaques primeiro).
  const secoes = useMemo(() => {
    const comItens = categorias.filter(
      (c) =>
        c.key !== "destaques" &&
        produtos.some((p) => p.categoria === c.key),
    );
    return comItens;
  }, []);

  const orderedKeys = useMemo<CategoriaKey[]>(
    () => ["destaques", ...secoes.map((s) => s.key)],
    [secoes],
  );

  // Scroll-spy: marca a categoria cuja seção está no topo.
  useEffect(() => {
    const handler = () => {
      if (travaScroll.current) return;
      let atual: CategoriaKey = orderedKeys[0];
      for (const key of orderedKeys) {
        const el = sectionRefs.current[key];
        if (el && el.getBoundingClientRect().top <= STICKY_OFFSET + 20) {
          atual = key;
        }
      }
      setActive(atual);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [orderedKeys]);

  const irPara = useCallback((key: CategoriaKey) => {
    const el = sectionRefs.current[key];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
    travaScroll.current = true;
    setActive(key);
    window.scrollTo({ top: y, behavior: "smooth" });
    window.setTimeout(() => {
      travaScroll.current = false;
    }, 700);
  }, []);

  const setRef = (key: string) => (el: HTMLElement | null) => {
    sectionRefs.current[key] = el;
  };

  return (
    <CartProvider>
      <div className="min-h-screen pb-40">
        <RestaurantHeader />

        <CategoryNav categorias={categorias} active={active} onSelect={irPara} />

        <div className="mx-auto max-w-3xl">
          {/* Destaques */}
          <section ref={setRef("destaques")} className="scroll-mt-28">
            <Highlights itens={destaques} />
          </section>

          {/* Seções por categoria */}
          {secoes.map((c) => {
            const itens = produtos.filter((p) => p.categoria === c.key);
            return (
              <section
                key={c.key}
                ref={setRef(c.key)}
                className="scroll-mt-28 px-4 pt-8"
              >
                <h2 className="font-display text-2xl uppercase text-urban-light">
                  {c.label}
                </h2>
                <div className="mt-1 divide-y divide-urban-line">
                  {itens.map((p) => (
                    <ItemRow key={p.id} produto={p} />
                  ))}
                </div>
              </section>
            );
          })}

          <p className="mt-12 px-4 text-center text-xs text-urban-gray">
            Urban Burger · cardápio digital · imagens ilustrativas
          </p>
        </div>

        <BottomBar
          onOpenCart={() => setCartOpen(true)}
          onOpenPromos={() => setPromosOpen(true)}
        />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <PromoModal open={promosOpen} onClose={() => setPromosOpen(false)} />
      </div>
    </CartProvider>
  );
}
