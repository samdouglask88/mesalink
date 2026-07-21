"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PapelStaff } from "@/lib/database.types";

// Usuário logado, mas sem o papel exigido pela rota.
export default function SemPermissao({
  papelEsperado,
  papelAtual,
}: {
  papelEsperado: PapelStaff;
  papelAtual: PapelStaff | null;
}) {
  const router = useRouter();

  async function trocar() {
    await createClient().auth.signOut();
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-4xl">🔒</div>
      <h1 className="text-xl font-semibold">Sem permissão</h1>
      <p className="text-neutral-400">
        Esta área é do papel <strong>{papelEsperado}</strong>.
        {papelAtual
          ? ` Sua conta tem o papel ${papelAtual}.`
          : " Sua conta não está cadastrada como staff."}
      </p>
      <button
        onClick={trocar}
        className="mt-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm transition hover:border-brand-500"
      >
        Entrar com outra conta
      </button>
    </main>
  );
}
