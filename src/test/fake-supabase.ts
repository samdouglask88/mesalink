// Client Supabase falso para os testes de componente (jsdom).
//
// Mesma ideia do `fakeClient` de src/lib/edge.test.ts — implementa só o que a
// unidade sob teste usa e devolve um `SupabaseClient` por cast único — mas aqui
// o que os dashboards de staff usam é o builder do postgrest (encadeado e
// "thenable") e o canal de Realtime:
//
//   from(t).select(cols).in(col, vals).order(col, { ascending })   -> leitura
//   from(t).update(vals).eq(col, val)                              -> escrita
//   channel(nome).on('postgres_changes', filtro, cb).subscribe()   -> realtime
//   removeChannel(canal)                                           -> limpeza
//
// Nada de rede, nada de relógio: a resposta é definida pelo teste e as chamadas
// ficam registradas para inspeção do payload.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type Client = SupabaseClient<Database>;

export type ErroPostgrest = { message: string };

/** Resposta de uma leitura: linhas ou erro, como o postgrest devolve. */
export type Resposta = { data: unknown[] | null; error: ErroPostgrest | null };

/** Resposta de uma escrita: o dashboard só olha o `error`. */
export type RespostaUpdate = { error: ErroPostgrest | null };

export const linhas = (data: unknown[]): Resposta => ({ data, error: null });

export const falha = (message: string): Resposta => ({
  data: null,
  error: { message },
});

/** Chamada de leitura registrada, com filtro e ordenação pedidos ao backend. */
export type ChamadaSelect = {
  tabela: string;
  colunas: string;
  filtroIn?: { coluna: string; valores: readonly unknown[] };
  ordem?: { coluna: string; ascending?: boolean };
};

/** Chamada de escrita registrada, com o payload e o filtro. */
export type ChamadaUpdate = {
  tabela: string;
  valores: Record<string, unknown>;
  filtroEq?: { coluna: string; valor: unknown };
};

export type Canal = {
  nome: string;
  /** Filtros passados em `.on('postgres_changes', filtro, cb)`. */
  filtros: Record<string, unknown>[];
  inscrito: boolean;
  removido: boolean;
};

export type FakeSupabase = {
  client: Client;
  /** Leituras feitas, na ordem. */
  selects: ChamadaSelect[];
  /** Escritas feitas, na ordem. */
  updates: ChamadaUpdate[];
  /** Canais criados, na ordem. */
  canais: Canal[];
  /** Troca a resposta das próximas leituras. */
  responderLeitura: (r: Resposta) => void;
  /** Troca a resposta das próximas escritas. */
  responderUpdate: (r: RespostaUpdate) => void;
  /**
   * Dispara os handlers de Realtime dos canais inscritos e não removidos —
   * é o que o Postgres faria ao mudar uma linha da tabela observada.
   */
  emitirRealtime: () => void;
};

type Handler = () => void;

export function fakeSupabase(inicial: Resposta = linhas([])): FakeSupabase {
  const selects: ChamadaSelect[] = [];
  const updates: ChamadaUpdate[] = [];
  const canais: Canal[] = [];
  const handlers = new Map<Canal, Handler[]>();

  let leitura = inicial;
  let escrita: RespostaUpdate = { error: null };

  // O builder resolve tarde (na hora do await), então o teste pode trocar a
  // resposta entre o render e o momento em que a promessa é consumida.
  function thenable<T>(valor: () => T) {
    return {
      then<R1 = T, R2 = never>(
        aoResolver?: ((v: T) => R1 | PromiseLike<R1>) | null,
        aoRejeitar?: ((e: unknown) => R2 | PromiseLike<R2>) | null,
      ): PromiseLike<R1 | R2> {
        return Promise.resolve(valor()).then(aoResolver, aoRejeitar);
      },
    };
  }

  function selectBuilder(chamada: ChamadaSelect) {
    const builder = {
      ...thenable(() => leitura),
      in(coluna: string, valores: readonly unknown[]) {
        chamada.filtroIn = { coluna, valores };
        return builder;
      },
      order(coluna: string, opcoes?: { ascending?: boolean }) {
        chamada.ordem = { coluna, ascending: opcoes?.ascending };
        return builder;
      },
    };
    return builder;
  }

  function updateBuilder(chamada: ChamadaUpdate) {
    const builder = {
      ...thenable(() => escrita),
      eq(coluna: string, valor: unknown) {
        chamada.filtroEq = { coluna, valor };
        return builder;
      },
    };
    return builder;
  }

  function from(tabela: string) {
    return {
      select(colunas: string) {
        const chamada: ChamadaSelect = { tabela, colunas };
        selects.push(chamada);
        return selectBuilder(chamada);
      },
      update(valores: Record<string, unknown>) {
        const chamada: ChamadaUpdate = { tabela, valores };
        updates.push(chamada);
        return updateBuilder(chamada);
      },
    };
  }

  function channel(nome: string) {
    const canal: Canal = { nome, filtros: [], inscrito: false, removido: false };
    canais.push(canal);
    handlers.set(canal, []);

    const api = {
      on(_evento: string, filtro: Record<string, unknown>, cb: Handler) {
        canal.filtros.push(filtro);
        handlers.get(canal)?.push(cb);
        return api;
      },
      subscribe() {
        canal.inscrito = true;
        return canal;
      },
    };
    return api;
  }

  function removeChannel(canal: Canal) {
    canal.removido = true;
  }

  const client = { from, channel, removeChannel } as unknown as Client;

  return {
    client,
    selects,
    updates,
    canais,
    responderLeitura: (r) => {
      leitura = r;
    },
    responderUpdate: (r) => {
      escrita = r;
    },
    emitirRealtime: () => {
      for (const canal of canais) {
        if (!canal.inscrito || canal.removido) continue;
        for (const h of handlers.get(canal) ?? []) h();
      }
    },
  };
}
