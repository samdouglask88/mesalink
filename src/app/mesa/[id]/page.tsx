// Tela do cliente na mesa. O segmento [id] é o TOKEN da comanda (o que o QR
// code na mesa codifica). Com ele montamos um client anônimo que manda
// `x-comanda-token` — é assim que a RLS libera a leitura da comanda e do
// cardápio. O fetch inicial é feito no servidor (SSR); o realtime e o carrinho
// ficam no client component MesaClient.
import { createComandaServerClient } from "@/lib/supabase/server";
import MesaClient from "@/components/mesa/MesaClient";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-4xl">🍔</div>
      <h1 className="text-xl font-semibold">{titulo}</h1>
      <p className="text-neutral-400">{texto}</p>
    </main>
  );
}
