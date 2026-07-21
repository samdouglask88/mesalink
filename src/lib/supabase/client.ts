"use client";

// Clients Supabase para o BROWSER.
//
// - createClient(): client "de staff" (cozinha/caixa). Usa @supabase/ssr para
//   persistir a sessão do Auth em cookies, de modo que o server component
//   também enxergue quem está logado.
// - createComandaClient(token): client "de cliente/mesa". É anônimo e se
//   identifica no backend pelo header `x-comanda-token` (a RLS do backend lê
//   esse header). Sem sessão de Auth.
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client do staff logado (sessão persistida em cookies). */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Client do dispositivo do cliente na mesa. O `token` (da comanda) vai em todo
 * request como header `x-comanda-token` — é assim que a RLS libera a leitura da
 * comanda/pedidos/fechamento e as Edge Functions autenticam o dono da comanda.
 */
export function createComandaClient(token: string) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-comanda-token": token } },
  });
}
