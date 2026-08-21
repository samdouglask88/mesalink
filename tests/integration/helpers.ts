// Utilitários dos testes de integração. Eles batem no backend local de verdade
// (PostgREST + Edge Functions), então só rodam com o stack de pé e INTEGRATION=1.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, PapelStaff } from "@/lib/database.types";

export const INTEGRATION = process.env.INTEGRATION === "1";

export const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
// Só é usada para MONTAR fixture (provisionar staff no Auth, criar a mesa/comanda
// do teste). Nunca para afirmar o que um papel pode ou não fazer.
export const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Token da comanda de exemplo criada pelo seed.sql do backend (mesa 1, aberta).
export const SEED_TOKEN = process.env.SEED_COMANDA_TOKEN ?? "token-dev-mesa-1";

export type Client = SupabaseClient<Database>;

// Mesma configuração do client de mesa do app: anônimo + header x-comanda-token.
export function comandaClient(token: string): Client {
  return createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-comanda-token": token } },
  });
}

// Client com service_role (passa por cima da RLS). Existe apenas para preparar
// fixture — os testes de permissão sempre usam o client do papel testado.
export function serviceClient(): Client {
  return createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// -----------------------------------------------------------------------------
// Staff
//
// O seed.sql do backend NÃO cria staff (nem usuário em auth.users, nem linha em
// public.staff), então não existe credencial pronta para reaproveitar. Estes
// helpers provisionam o usuário pelo Auth admin (service_role) — do mesmo jeito
// que os testes de Edge Function do MesaLink-API fazem em
// supabase/functions/tests/_helpers.ts — e depois entram pelo Supabase Auth
// exatamente como a tela de login do app (signInWithPassword).
// -----------------------------------------------------------------------------

export const STAFF_SENHA = "senha-teste-integracao-123";

// E-mails próprios do front, para não disputar com os testes do backend.
export function staffEmail(papel: PapelStaff): string {
  return `${papel}.front@mesalink.local`;
}

/** Usuário de staff com o papel dado, já autenticado (sessão em memória). */
export async function staffClient(papel: PapelStaff): Promise<Client> {
  const db = serviceClient();
  const email = staffEmail(papel);

  const { data: criado, error: erroCriar } = await db.auth.admin.createUser({
    email,
    password: STAFF_SENHA,
    email_confirm: true,
  });

  let userId = criado.user?.id ?? "";
  if (!userId) {
    // Já existe de uma execução anterior: acha pela listagem do Auth admin.
    const { data: lista } = await db.auth.admin.listUsers();
    userId = lista.users.find((u) => u.email === email)?.id ?? "";
  }
  if (!userId) {
    throw erroCriar ?? new Error(`Não consegui provisionar o staff ${email}.`);
  }

  const { error: erroStaff } = await db.from("staff").upsert(
    { auth_user_id: userId, nome: `Teste ${papel}`, papel },
    { onConflict: "auth_user_id" },
  );
  if (erroStaff) throw erroStaff;

  // Mesmo caminho de login do app (components/staff/StaffLogin).
  const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: erroLogin } = await client.auth.signInWithPassword({
    email,
    password: STAFF_SENHA,
  });
  if (erroLogin) throw erroLogin;

  return client;
}

// -----------------------------------------------------------------------------
// Fixture de comanda própria
//
// O fluxo do staff termina com a comanda FECHADA e a mesa liberada, então ele
// não pode usar a comanda do seed (que o cliente.test.ts também mexe): cada
// arquivo precisa de uma comanda só sua para não depender de ordem de execução.
// -----------------------------------------------------------------------------

/**
 * Recria, do zero, a mesa `numero` com uma comanda aberta de token fixo.
 * Apaga restos de uma execução anterior primeiro, para o teste ser repetível
 * mesmo sem `supabase db reset` entre rodadas.
 */
export async function recriarComandaAberta(
  db: Client,
  numero: number,
  token: string,
): Promise<{ mesaId: string; comandaId: string; token: string }> {
  const { data: mesaAntiga } = await db
    .from("mesas")
    .select("id")
    .eq("numero", numero)
    .maybeSingle();

  // Comandas a limpar: as da mesa antiga e a que já usa o token (token é unique).
  const ids = new Set<string>();
  if (mesaAntiga) {
    const { data } = await db.from("comandas").select("id").eq("mesa_id", mesaAntiga.id);
    for (const c of data ?? []) ids.add(c.id);
  }
  const { data: porToken } = await db.from("comandas").select("id").eq("token", token);
  for (const c of porToken ?? []) ids.add(c.id);

  if (ids.size > 0) {
    const lista = [...ids];
    // fechamentos referenciam comandas sem cascade -> saem primeiro.
    // pedidos/itens_pedido caem por ON DELETE CASCADE.
    const { error: erroFech } = await db.from("fechamentos").delete().in("comanda_id", lista);
    if (erroFech) throw erroFech;
    const { error: erroCom } = await db.from("comandas").delete().in("id", lista);
    if (erroCom) throw erroCom;
  }
  if (mesaAntiga) {
    const { error } = await db.from("mesas").delete().eq("id", mesaAntiga.id);
    if (error) throw error;
  }

  const { data: mesa, error: erroMesa } = await db
    .from("mesas")
    .insert({ numero, status: "ocupada" })
    .select("id")
    .single();
  if (erroMesa) throw erroMesa;

  const { data: comanda, error: erroComanda } = await db
    .from("comandas")
    .insert({ mesa_id: mesa.id, token, status: "aberta" })
    .select("id")
    .single();
  if (erroComanda) throw erroComanda;

  return { mesaId: mesa.id, comandaId: comanda.id, token };
}
