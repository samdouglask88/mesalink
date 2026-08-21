# Decisões técnicas e testes

Notas do frontend `mesalink`. O backend (`MesaLink-API`) é consumido como está;
nada de banco/RLS/Edge Function foi alterado.

## Decisões

### `/mesa/[id]` usa `[id]` = token da comanda

O cliente é o papel `anon` e só enxerga qualquer coisa via RLS se apresentar o
header `x-comanda-token` (ver `current_comanda_token()` e as policies
`cliente_ve_*` no backend). Logo, o token é o que identifica a sessão da mesa.

Por isso `[id]` é o **token da comanda** (ex.: `/mesa/token-dev-mesa-1`) — o
valor que o QR code na mesa deve codificar. A partir dele o app resolve
`comanda_id` e o número da mesa. Não dá para usar só o número/UUID da mesa: sem
o token a RLS não libera leitura nenhuma.

### Camada de clients Supabase

Isolada em `src/lib/supabase/`, com dois tipos de client:

- **staff** (`createClient`) — `@supabase/ssr`, sessão do Auth em cookies, para o
  server component conseguir checar o papel. Usado em `/cozinha` e `/caixa`.
- **comanda** (`createComandaClient` / `createComandaServerClient`) — anônimo,
  com `x-comanda-token` em todo request. Usado na tela da mesa.

O gate de papel roda no servidor (`src/lib/staff-guard.ts`), e o
`middleware.ts` renova a sessão nas rotas de staff.

### Sem regra de negócio no frontend

Preço, total e atomicidade ficam no backend. O carrinho mostra itens e
quantidades, mas **não soma preços** (`src/lib/carrinho.ts` só lida com
quantidades). As Edge Functions são consumidas por wrappers finos em
`src/lib/edge.ts`, que apenas montam o request e traduzem o `{ error, message }`
de volta num `EdgeError` tipado.

### Ajustes de versão

Durante a verificação, o npm resolveu `@supabase/supabase-js@2.110`, que mudou os
genéricos de `SupabaseClient`. O `@supabase/ssr@0.5` (assinatura antiga de 3
genéricos) passava o objeto de schema para o slot errado, e todo tipo de linha
virava `never` (erros em `.update()`/`.select()`). Correção: subir o
`@supabase/ssr` para `^0.7`. O Next também foi para `14.2.35` (patch de
segurança sobre o `14.2.15`).

## Ponto de integração a confirmar: Realtime + RLS do cliente

As telas de staff se autenticam por JWT, então o Realtime aplica a RLS por papel
(`current_staff_papel()` usa `auth.uid()`, disponível no Realtime).

Já o cliente da mesa é anônimo e se identifica pelo header `x-comanda-token`, que
o **PostgREST** expõe às policies em requisições HTTP — mas o **Realtime**
(websocket) pode não repassar esse header. Se for o caso no seu projeto, os
eventos de `pedidos`/`fechamentos` do cliente seriam filtrados pela RLS.

Mitigação no frontend (sem mexer no backend): a tela da mesa não depende só do
push do Realtime — ela **refaz o fetch via REST** (com o header, que a RLS
enxerga) no fetch inicial, a cada evento recebido e após enviar cada pedido.
Ainda assim, confirme no backend que `pedidos` e `fechamentos` estão na
publication `supabase_realtime`.

## Testes

### Unitários — `npm test`

Vitest + Testing Library, ao lado do código (`src/**/*.test.{ts,tsx}`). Não
precisam de backend. Cobrem:

- `src/lib/format.test.ts` — formatação BRL e hora (inclui null / string
  numérica do Postgres / valor inválido).
- `src/lib/carrinho.test.ts` — add/incrementa/remove no zero, nunca negativa,
  imutabilidade, `totalItens`, payload de `criar-pedido`.
- `src/lib/edge.test.ts` — `mensagemDoErro` (código conhecido/desconhecido,
  Error, não-Error) e os wrappers `criarPedido`/`solicitarFechamento`/
  `fecharConta` com um client falso: valida o corpo enviado e a tradução do
  erro HTTP da function num `EdgeError` com o código do backend.
- `src/components/mesa/Cardapio.test.tsx` e `Carrinho.test.tsx` — render,
  agrupamento por categoria, botões +/- e "enviar pedido", estado vazio e
  `enviando`.

Estado atual: **89 testes, todos passando.**

### Integração — `npm run test:integration` (precisa do backend)

Batem no backend local de verdade (PostgREST + Edge Functions) exercitando o
**mesmo código do app** (clients de comanda/staff + `src/lib/edge.ts`).

`tests/integration/cliente.test.ts` — lado do cliente (mesa), na comanda do seed:

- leitura via RLS: só cardápio disponível; enxerga a própria comanda pelo token;
  **não** enxerga com token errado;
- `criar-pedido`: cria pedido `recebido` com preço vindo do banco; pedido fica
  visível; recusa item inexistente (`ITEM_NAO_ENCONTRADO`) e token inválido
  (`TOKEN_INVALIDO`);
- `solicitar-fechamento`: cria o fechamento `solicitado`, o cliente passa a
  vê-lo e novos pedidos são recusados (`COMANDA_NAO_ABERTA`).

`tests/integration/staff.test.ts` — lado do staff, em mesa/comanda próprias
(mesa 9501), para não depender da ordem de execução nem do estado da comanda do
seed:

- **cozinha**: autentica pelo Supabase Auth e só enxerga a própria linha em
  `staff`; lê a fila de pedidos com os itens (mesma query do `CozinhaDashboard`);
  avança `recebido → preparo → pronto → entregue`; o entregue sai da fila;
  é recusada ao alterar coluna que não seja `status` — o trigger
  `pedidos_cozinha_somente_status` responde `42501 COZINHA_SO_ALTERA_STATUS`;
- **caixa**: lê a conta pendente com o número da mesa (mesma query do
  `CaixaDashboard`); avisa o garçom (`avisado`); fecha a conta pela Edge Function
  `fechar-conta` com forma de pagamento e **total vindo do banco**; a comanda
  fica `fechada` e a mesa `livre`; fechar de novo é recusado
  (`FECHAMENTO_JA_FECHADO`) e pedido novo na comanda fechada também
  (`COMANDA_NAO_ABERTA`);
- **isolamento de papel**: cozinha não enxerga `fechamentos`/`comandas`/`mesas`,
  seu UPDATE em `fechamentos` não afeta linha nenhuma e a Edge Function a recusa
  com `SEM_PERMISSAO`; o UPDATE do caixa em `pedidos` também não afeta linha
  nenhuma (confirmado lendo pelo papel que *pode* ler);
- o total do fechamento soma **só os pedidos entregues** — há um pedido deixado
  em `recebido` de propósito para provar isso.

Eles se **auto-ignoram** (`describe.skipIf`) quando `INTEGRATION` não é `1`, para
não quebrar CI sem backend.

> O `seed.sql` do backend **não cria staff** (nenhum usuário em `auth.users`,
> nenhuma linha em `public.staff`), então não há credencial pronta para
> reaproveitar: `tests/integration/helpers.ts` provisiona os usuários de
> cozinha/caixa pelo Auth admin — como os testes de Edge Function do
> MesaLink-API já fazem — e entra por `signInWithPassword`, igual ao app. Por
> isso `staff.test.ts` exige também a `SUPABASE_SERVICE_ROLE_KEY` (usada só para
> montar fixture, nunca para afirmar permissão). Se o backend passar a semear
> staff com credencial conhecida, esse helper pode virar só o login.

**Como rodar** (precisa de Docker Desktop aberto):

```powershell
# sobe o stack do MesaLink-API, reaplica o seed, serve as functions e roda tudo
npm run test:int:full
```

Ou, com o stack já de pé e as chaves em mãos:

```powershell
$env:INTEGRATION="1"; $env:SUPABASE_URL="http://127.0.0.1:54321"
$env:SUPABASE_ANON_KEY="<anon>"; $env:SUPABASE_SERVICE_ROLE_KEY="<service_role>"
npm run test:integration
```

(As chaves saem de `npx supabase status -o env`, no `MesaLink-API`.)

> Observação honesta: os testes de integração **ainda não foram executados** de
> ponta a ponta neste ambiente (nem os do cliente, nem os do staff). Eles estão
> escritos, passam no `tsc` e auto-ignoram sem o backend; rode
> `npm run test:int:full` com o Docker aberto para executá-los.
