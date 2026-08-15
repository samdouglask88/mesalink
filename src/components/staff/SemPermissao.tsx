"use client";

import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { GraffitiBackground } from "@/components/landing/GraffitiBackground";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <GraffitiBackground />

      <div className="w-full max-w-sm rounded-4xl border border-urban-line bg-urban-surface p-8 text-center shadow-card">
        <Logo iconOnly className="mx-auto mb-6 h-10 w-10" />

        <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-red-500/10">
          <ShieldX className="h-8 w-8 text-red-400" />
        </span>

        <h1 className="font-display text-3xl uppercase leading-none text-urban-light">
          Sem permissão
        </h1>
        <p className="mt-3 text-sm text-urban-muted">
          Esta área é do papel{" "}
          <strong className="text-urban-primary">{papelEsperado}</strong>.
          {papelAtual
            ? ` Sua conta tem o papel ${papelAtual}.`
            : " Sua conta não está cadastrada como staff."}
        </p>

        <button
          onClick={trocar}
          className="mt-6 w-full rounded-full border border-urban-line bg-urban-bg px-4 py-3 text-sm font-semibold text-urban-light transition-colors hover:border-urban-primary hover:text-urban-primary"
        >
          Entrar com outra conta
        </button>
      </div>
    </main>
  );
}
