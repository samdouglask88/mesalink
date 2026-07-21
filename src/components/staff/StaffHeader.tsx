"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <header className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-brand-400">🍔 MesaLink</p>
        <h1 className="text-2xl font-bold">{titulo}</h1>
      </div>
      <div className="text-right">
        <p className="text-sm text-neutral-400">{nome}</p>
        <button
          onClick={sair}
          className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-300"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
