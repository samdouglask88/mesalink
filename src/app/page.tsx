import Link from "next/link";

// Página inicial simples — só um índice das rotas. A tela real do cliente é
// acessada pelo QR code da mesa (/mesa/<token-da-comanda>).
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          🍔 MesaLink
        </h1>
        <p className="mt-2 text-neutral-400">Comanda digital.</p>
      </div>

      <nav className="grid gap-3">
        <Link
          href="/cozinha"
          className="rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4 transition hover:border-brand-500"
        >
          <span className="font-semibold">Painel da Cozinha</span>
          <p className="text-sm text-neutral-400">Fila de pedidos (login)</p>
        </Link>
        <Link
          href="/caixa"
          className="rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4 transition hover:border-brand-500"
        >
          <span className="font-semibold">Painel do Caixa</span>
          <p className="text-sm text-neutral-400">Fechamentos (login)</p>
        </Link>
      </nav>

      <p className="text-xs text-neutral-600">
        A tela do cliente fica em <code>/mesa/&lt;token-da-comanda&gt;</code>,
        acessada pelo QR code na mesa.
      </p>
    </main>
  );
}
