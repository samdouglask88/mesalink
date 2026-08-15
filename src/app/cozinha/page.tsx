// Painel da cozinha. Server component: checa login + papel 'cozinha' e só então
// renderiza o dashboard (client, com realtime).
import { checarStaff } from "@/lib/staff-guard";
import StaffLogin from "@/components/staff/StaffLogin";
import SemPermissao from "@/components/staff/SemPermissao";
import CozinhaDashboard from "@/components/cozinha/CozinhaDashboard";

export const dynamic = "force-dynamic";

export default async function CozinhaPage() {
  const r = await checarStaff("cozinha");

  if (r.status === "anon") return <StaffLogin titulo="Painel da Cozinha" />;
  if (r.status === "forbidden")
    return <SemPermissao papelEsperado="cozinha" papelAtual={r.papel} />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <CozinhaDashboard nome={r.nome} />
    </main>
  );
}
