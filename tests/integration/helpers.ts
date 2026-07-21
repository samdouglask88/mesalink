// Utilitários dos testes de integração. Eles batem no backend local de verdade
// (PostgREST + Edge Functions), então só rodam com o stack de pé e INTEGRATION=1.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const INTEGRATION = process.env.INTEGRATION === "1";

export const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Token da comanda de exemplo criada pelo seed.sql do backend (mesa 1, aberta).
export const SEED_TOKEN = process.env.SEED_COMANDA_TOKEN ?? "token-dev-mesa-1";

// Mesma configuração do client de mesa do app: anônimo + header x-comanda-token.
export function comandaClient(token: string) {
  return createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-comanda-token": token } },
  });
}
