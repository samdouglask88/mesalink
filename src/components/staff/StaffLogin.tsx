"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { GraffitiBackground } from "@/components/landing/GraffitiBackground";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <GraffitiBackground />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="mb-6" />
          <h1 className="font-display text-4xl uppercase leading-none text-urban-light">
            {titulo}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-urban-muted">
            <Lock className="h-3.5 w-3.5" />
            Acesso restrito à equipe
          </p>
        </div>

        <form
          onSubmit={entrar}
          className="space-y-3 rounded-4xl border border-urban-line bg-urban-surface p-6 shadow-card"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            autoComplete="email"
            className="w-full rounded-2xl border border-urban-line bg-urban-bg px-4 py-3 text-urban-light outline-none transition-colors placeholder:text-urban-gray focus:border-urban-primary"
          />
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-urban-line bg-urban-bg px-4 py-3 text-urban-light outline-none transition-colors placeholder:text-urban-gray focus:border-urban-primary"
          />

          {erro && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full bg-urban-primary px-4 py-3 font-bold text-urban-bg shadow-glow-sm transition-all hover:bg-urban-primary-600 hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
          >
            {carregando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
