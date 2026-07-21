"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Formulário de login do staff (Supabase Auth por e-mail/senha). Ao autenticar,
// dá refresh para o server component reavaliar o papel e liberar o painel.
export default function StaffLogin({ titulo }: { titulo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      setCarregando(false);
      return;
    }
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <p className="text-sm text-brand-400">🍔 MesaLink</p>
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <p className="mt-1 text-sm text-neutral-400">Acesso restrito à equipe.</p>
      </div>

      <form onSubmit={entrar} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          autoComplete="email"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-brand-500"
        />
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          autoComplete="current-password"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-brand-500"
        />

        {erro && <p className="text-sm text-red-300">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-lg bg-brand-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-brand-400 disabled:opacity-60"
        >
          {carregando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
