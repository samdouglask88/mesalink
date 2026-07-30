"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Produto } from "@/lib/pedido-data";

export interface CartLine {
  produto: Produto;
  qtd: number;
}

interface CartCtx {
  linhas: CartLine[];
  add: (p: Produto) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  qtdDe: (id: string) => number;
  totalItens: number;
  totalValor: number;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [linhas, setLinhas] = useState<CartLine[]>([]);

  const add = useCallback((p: Produto) => {
    setLinhas((prev) => {
      const found = prev.find((l) => l.produto.id === p.id);
      if (found) {
        return prev.map((l) =>
          l.produto.id === p.id ? { ...l, qtd: l.qtd + 1 } : l,
        );
      }
      return [...prev, { produto: p, qtd: 1 }];
    });
  }, []);

  const inc = useCallback((id: string) => {
    setLinhas((prev) =>
      prev.map((l) => (l.produto.id === id ? { ...l, qtd: l.qtd + 1 } : l)),
    );
  }, []);

  const dec = useCallback((id: string) => {
    setLinhas((prev) =>
      prev
        .map((l) => (l.produto.id === id ? { ...l, qtd: l.qtd - 1 } : l))
        .filter((l) => l.qtd > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLinhas((prev) => prev.filter((l) => l.produto.id !== id));
  }, []);

  const clear = useCallback(() => setLinhas([]), []);

  const qtdDe = useCallback(
    (id: string) => linhas.find((l) => l.produto.id === id)?.qtd ?? 0,
    [linhas],
  );

  const totalItens = useMemo(
    () => linhas.reduce((s, l) => s + l.qtd, 0),
    [linhas],
  );
  const totalValor = useMemo(
    () => linhas.reduce((s, l) => s + l.qtd * l.produto.preco, 0),
    [linhas],
  );

  const value = useMemo(
    () => ({
      linhas,
      add,
      inc,
      dec,
      remove,
      clear,
      qtdDe,
      totalItens,
      totalValor,
    }),
    [linhas, add, inc, dec, remove, clear, qtdDe, totalItens, totalValor],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
