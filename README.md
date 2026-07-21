# MesaLink (frontend)

Frontend do sistema de comanda digital. **Só frontend** — o backend (Supabase:
Postgres, RLS, Realtime, Auth e as 3 Edge Functions) vive no projeto
`MesaLink-API` e é consumido aqui via `@supabase/supabase-js`. Nenhuma regra de
negócio ou cálculo de preço mora neste projeto.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- `@supabase/supabase-js` + `@supabase/ssr`
- Deploy alvo: Vercel

## Rodando

```bash
npm install
cp .env.example .env.local   # preencha URL + anon key do Supabase
npm run dev
```

Variáveis (`.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_PROJECT_ID` (só para `npm run gen:types`)

## Rotas

### `/mesa/[id]` — cliente

`[id]` é o **token da comanda** (o que o QR code na mesa codifica, ex.:
`/mesa/token-dev-mesa-1`). Com esse token o app monta um client anônimo que
manda o header `x-comanda-token` em toda requisição — é assim que a RLS do
backend libera a leitura da comanda/cardápio/pedidos/fechamento e as Edge
Functions autenticam o dono da comanda.

- Lista o cardápio (`itens_cardapio` com `disponivel = true`).
- Carrinho **local** (estado do componente, sem persistência).
- "Enviar pedido" → Edge Function `criar-pedido`.
- Realtime em `pedidos` (filtrado pela comanda) mostrando o status ao vivo.
- Com ao menos um pedido `entregue`, aparece "Solicitar fechamento" →
  Edge Function `solicitar-fechamento`.
- Depois, o status do fechamento é acompanhado por Realtime em `fechamentos`.

> O carrinho mostra itens e quantidades, mas **não** soma preços — o total
> definitivo vem do backend no fechamento.

### `/cozinha` — cozinha (login)

- Supabase Auth (e-mail/senha). Acesso só com `staff.papel = 'cozinha'`
  (checado no server component).
- Realtime em `pedidos` mostrando apenas `recebido` / `preparo` / `pronto`
  (nunca `entregue` nem nada de fechamento).
- Botões para avançar o status (`update` direto, protegido pela RLS + trigger
  de coluna do backend).

### `/caixa` — caixa (login)

- Supabase Auth. Acesso só com `staff.papel = 'caixa'`.
- Realtime em `fechamentos` com status `solicitado` / `avisado`.
- "Avisar garçom" → `update` direto (`status = 'avisado'`).
- "Confirmar pagamento" → Edge Function `fechar-conta`.

## Estrutura

```
src/
  app/
    page.tsx                # índice
    mesa/[id]/page.tsx      # SSR: resolve comanda pelo token
    cozinha/page.tsx        # gate de papel + dashboard
    caixa/page.tsx          # gate de papel + dashboard
  lib/
    supabase/client.ts      # clients de browser (staff + comanda)
    supabase/server.ts      # clients de servidor (staff + comanda)
    database.types.ts       # tipos do schema (supabase gen types)
    edge.ts                 # wrappers das Edge Functions
    format.ts               # formatação (exibição)
    staff-guard.ts          # checagem de papel no servidor
  components/
    mesa/                   # Cardapio, Carrinho, PedidosAoVivo, FechamentoStatus
    cozinha/                # CozinhaDashboard
    caixa/                  # CaixaDashboard
    staff/                  # StaffLogin, StaffHeader, SemPermissao
    ui/                     # StatusBadge
middleware.ts               # renova a sessão do Auth em /cozinha e /caixa
```

## Testes

```bash
npm test              # unitários (Vitest + Testing Library) — não precisam de backend
npm run test:int:full # integração: sobe o backend local (Docker) e roda tudo
```

Detalhes, cobertura e pré-requisitos em
[docs/decisoes-e-testes.md](docs/decisoes-e-testes.md).

## Nota sobre Realtime e RLS do cliente (mesa)

As telas de staff se autenticam por JWT, então o Realtime aplica a RLS por papel
normalmente. Já o cliente da mesa é anônimo e se identifica pelo header
`x-comanda-token`, que o PostgREST expõe às policies em requisições HTTP. Se, no
seu projeto Supabase, o Realtime não repassar esse header às policies (as duas
tabelas precisam estar na publication `supabase_realtime`), a tela da mesa ainda
funciona: além de assinar o Realtime, ela refaz o fetch via REST (com o header)
no envio de cada pedido e a cada evento recebido. Vale confirmar no backend que
`pedidos` e `fechamentos` estão publicadas para Realtime.
