// Clients Supabase para o SERVIDOR (server components, route handlers).
//
// - createClient(): client de staff atrelado aos cookies da requisição, para
//   ler a sessão do Auth no servidor (usado para proteger /cozinha e /caixa).
// - createComandaServerClient(token): client anônimo identificado pelo
//   `x-comanda-token`, para o fetch inicial (SSR) da tela da mesa.
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client de staff no servidor, lendo/escrevendo a sessão nos cookies. */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` chamado a partir de um Server Component — pode ser
          // ignorado quando há um middleware renovando a sessão.
        }
      },
    },
  });
}

/** Client anônimo (SSR) da mesa, autenticado pelo token da comanda. */
export function createComandaServerClient(token: string) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-comanda-token": token } },
  });
}
