"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

// Cabeçalho dos painéis de staff, com nome de quem está logado e botão de sair.
export default function StaffHeader({
  titulo,
  nome,
}: {
  titulo: string;
  nome: string;
}) {
  const router = useRouter();

  async function sair() {
    await createClient().auth.signOut();
    router.refresh();
  }

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-urban-line pb-5">
      <div className="flex items-center gap-4">
        <Logo iconOnly className="h-9 w-9" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-urban-muted">
            Urban Burger
          </p>
          <h1 className="font-display text-3xl uppercase leading-none text-urban-light">
            {titulo}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-urban-light">{nome}</p>
          <p className="text-xs text-urban-muted">Equipe</p>
        </div>
        <button
          onClick={sair}
          className="inline-flex items-center gap-2 rounded-full border border-urban-line bg-urban-surface px-4 py-2 text-sm font-medium text-urban-muted transition-colors hover:border-urban-primary hover:text-urban-primary"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
