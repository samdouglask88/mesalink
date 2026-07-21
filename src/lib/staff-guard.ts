// Checagem de papel no servidor, reaproveitada por /cozinha e /caixa.
// Usa o client de servidor (cookies) para descobrir o usuário logado e
// consulta a tabela staff (RLS permite cada um ver a própria linha).
import { createClient } from "@/lib/supabase/server";
import type { PapelStaff } from "@/lib/database.types";

export type ResultadoStaff =
  | { status: "anon" }
  | { status: "forbidden"; papel: PapelStaff | null }
  | { status: "ok"; nome: string };

export async function checarStaff(
  papelEsperado: PapelStaff,
): Promise<ResultadoStaff> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anon" };

  const { data: staff } = await supabase
    .from("staff")
    .select("nome, papel")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!staff || staff.papel !== papelEsperado) {
    return { status: "forbidden", papel: staff?.papel ?? null };
  }
  return { status: "ok", nome: staff.nome };
}
