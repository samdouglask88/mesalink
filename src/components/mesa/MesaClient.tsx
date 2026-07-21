"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createComandaClient } from "@/lib/supabase/client";
import { criarPedido, solicitarFechamento, mensagemDoErro } from "@/lib/edge";
import {
  alterarQuantidade as alterarQtd,
  totalItens as contarItens,
  itensParaPedido,
  type Carrinho as CarrinhoState,
} from "@/lib/carrinho";
import type {
  Comanda,
  Fechamento,
  ItemCardapio,
  Pedido,
} from "@/lib/database.types";
import Cardapio from "./Cardapio";
import Carrinho from "./Carrinho";
import PedidosAoVivo from "./PedidosAoVivo";
import FechamentoStatus from "./FechamentoStatus";

type Props = {
  token: string;
  comandaId: string;
  comandaStatusInicial: Comanda["status"];
  mesaNumero: number | null;
  cardapio: ItemCardapio[];
};

export default function MesaClient({
  token,
  comandaId,
  comandaStatusInicial,
  mesaNumero,
  cardapio,
}: Props) {
  // Client anônimo com o header x-comanda-token — memoizado para a assinatura
  // realtime não recriar a cada render.
  const supabase = useMemo(() => createComandaClient(token), [token]);

  const [carrinho, setCarrinho] = useState<CarrinhoState>({});
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [fechamento, setFechamento] = useState<Fechamento | null>(null);
  const [comandaStatus, setComandaStatus] =
    useState<Comanda["status"]>(comandaStatusInicial);

  const [enviando, setEnviando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const refetchPedidos = useCallback(async () => {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .eq("comanda_id", comandaId)
      .order("created_at", { ascending: true });
    if (data) setPedidos(data);
  }, [supabase, comandaId]);

  const refetchFechamento = useCallback(async () => {
    const { data } = await supabase
      .from("fechamentos")
      .select("*")
      .eq("comanda_id", comandaId)
      .order("solicitado_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    setFechamento(data ?? null);
    if (data && comandaStatus === "aberta") {
      setComandaStatus("fechamento_solicitado");
    }
  }, [supabase, comandaId, comandaStatus]);

  // Fetch inicial + assinaturas realtime (pedidos e fechamentos da comanda).
  useEffect(() => {
    refetchPedidos();
    refetchFechamento();

    const channel = supabase
      .channel(`mesa-${comandaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `comanda_id=eq.${comandaId}`,
        },
        () => refetchPedidos(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fechamentos",
          filter: `comanda_id=eq.${comandaId}`,
        },
        () => refetchFechamento(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, comandaId, refetchPedidos, refetchFechamento]);

  const itensNoCarrinho = useMemo(() => contarItens(carrinho), [carrinho]);

  const temPedidoEntregue = useMemo(
    () => pedidos.some((p) => p.status === "entregue"),
    [pedidos],
  );

  const podePedir = comandaStatus === "aberta";

  function alterarQuantidade(itemId: string, delta: number) {
    setCarrinho((atual) => alterarQtd(atual, itemId, delta));
  }

  async function enviarPedido() {
    const itens = itensParaPedido(carrinho);
    if (itens.length === 0) return;

    setEnviando(true);
    setErro(null);
    try {
      await criarPedido(supabase, comandaId, itens);
      setCarrinho({});
      await refetchPedidos(); // além do realtime, garante feedback imediato
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setEnviando(false);
    }
  }

  async function pedirFechamento() {
    setSolicitando(true);
    setErro(null);
    try {
      const f = await solicitarFechamento(supabase, comandaId);
      setFechamento(f);
      setComandaStatus("fechamento_solicitado");
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setSolicitando(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-40 pt-6">
      <header className="mb-6">
        <p className="text-sm text-brand-400">🍔 MesaLink</p>
        <h1 className="text-2xl font-bold">
          {mesaNumero != null ? `Mesa ${mesaNumero}` : "Sua comanda"}
        </h1>
      </header>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {erro}
        </div>
      )}

      {/* Pedidos já enviados, com status ao vivo */}
      <PedidosAoVivo pedidos={pedidos} />

      {/* Fechamento (aparece assim que solicitado) */}
      {fechamento && <FechamentoStatus fechamento={fechamento} />}

      {/* Botão de solicitar fechamento: só com ao menos 1 pedido entregue e
          enquanto ainda não há fechamento em andamento. */}
      {temPedidoEntregue && !fechamento && (
        <button
          onClick={pedirFechamento}
          disabled={solicitando}
          className="mb-6 w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-brand-400 disabled:opacity-60"
        >
          {solicitando ? "Solicitando…" : "Solicitar fechamento da conta"}
        </button>
      )}

      {/* Cardápio + carrinho só enquanto a comanda estiver aberta */}
      {podePedir ? (
        <>
          <Cardapio
            itens={cardapio}
            carrinho={carrinho}
            onAlterar={alterarQuantidade}
          />
          <Carrinho
            itens={cardapio}
            carrinho={carrinho}
            totalItens={itensNoCarrinho}
            enviando={enviando}
            onAlterar={alterarQuantidade}
            onEnviar={enviarPedido}
          />
        </>
      ) : (
        <p className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
          Esta comanda não está mais aberta para novos pedidos.
        </p>
      )}
    </main>
  );
}
