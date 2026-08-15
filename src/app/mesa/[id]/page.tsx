// Tela do cliente na mesa. O segmento [id] é o TOKEN da comanda (o que o QR
// code na mesa codifica). Com ele montamos um client anônimo que manda
// `x-comanda-token` — é assim que a RLS libera a leitura da comanda e do
// cardápio. O fetch inicial é feito no servidor (SSR); o realtime e o carrinho
// ficam no client component MesaClient.
import { QrCode } from "lucide-react";
import { createComandaServerClient } from "@/lib/supabase/server";
import MesaClient from "@/components/mesa/MesaClient";
import { Logo } from "@/components/ui/Logo";
import { GraffitiBackground } from "@/components/landing/GraffitiBackground";

export const dynamic = "force-dynamic";

export default async function MesaPage({
  params,
}: {
  params: { id: string };
}) {
  const token = decodeURIComponent(params.id);
  const supabase = createComandaServerClient(token);

  // Comanda do próprio token (RLS: cliente só enxerga a sua).
  const { data: comanda } = await supabase
    .from("comandas")
    .select("id, mesa_id, status")
    .eq("token", token)
    .maybeSingle();

  if (!comanda) {
    return (
      <Aviso
        titulo="Comanda não encontrada"
        texto="Escaneie o QR code da mesa novamente para abrir sua comanda."
      />
    );
  }

  const [{ data: mesa }, { data: cardapio }] = await Promise.all([
    supabase.from("mesas").select("numero").eq("id", comanda.mesa_id).maybeSingle(),
    supabase
      .from("itens_cardapio")
      .select("*")
      .eq("disponivel", true)
      .order("categoria", { ascending: true })
      .order("nome", { ascending: true }),
  ]);

  return (
    <MesaClient
      token={token}
      comandaId={comanda.id}
      comandaStatusInicial={comanda.status}
      mesaNumero={mesa?.numero ?? null}
      cardapio={cardapio ?? []}
    />
  );
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <GraffitiBackground />
      <div className="w-full max-w-sm rounded-4xl border border-urban-line bg-urban-surface p-8 text-center shadow-card">
        <Logo className="mx-auto mb-6" />
        <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-urban-elevated">
          <QrCode className="h-8 w-8 text-urban-primary" />
        </span>
        <h1 className="font-display text-3xl uppercase leading-none text-urban-light">
          {titulo}
        </h1>
        <p className="mt-3 text-sm text-urban-muted">{texto}</p>
      </div>
    </main>
  );
}
