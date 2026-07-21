// Painel do caixa. Server component: checa login + papel 'caixa' e renderiza o
// dashboard (client, com realtime).
import { checarStaff } from "@/lib/staff-guard";
import StaffLogin from "@/components/staff/StaffLogin";
import SemPermissao from "@/components/staff/SemPermissao";
import CaixaDashboard from "@/components/caixa/CaixaDashboard";

export const dynamic = "force-dynamic";

export default async function CaixaPage() {
  const r = await checarStaff("caixa");

  if (r.status === "anon") return <StaffLogin titulo="Painel do Caixa" />;
  if (r.status === "forbidden")
    return <SemPermissao papelEsperado="caixa" papelAtual={r.papel} />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <CaixaDashboard nome={r.nome} />
    </main>
  );
}
