# Orla

Busca e reserva de hotéis em Next.js 16 (App Router). O front consome somente a `mock-api` desta pasta. A URL da API vem de `NEXT_PUBLIC_API_URL`.

## Como rodar

São dois processos: a API e o front.

```bash
# 1. API (porta 3333, atraso de 300ms)
cd mock-api
npm install
npm run server

# 2. Front, em outro terminal, na raiz do repositório
npm install
cp .env.example .env.local
npm run dev
```

Atalho para a API, a partir da raiz: `npm run dev:api`.

Abra [http://localhost:3000](http://localhost:3000).

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Next.js em desenvolvimento |
| `npm run dev:api` | mock-api na porta 3333 |
| `npm test` | Vitest: regras de negócio e testes de interface com Testing Library |
| `npm run lint` | Biome |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | build de produção |
| `npm run test:e2e` | Cypress. Precisa do front em `localhost:3000` e da API em `3333` |

`.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Não há `localhost` fixo no código. Em produção, troque a variável pela URL pública da API.

A mock-api recria `db.json` a partir de `db.seed.json` a cada start. Reservas somem no reinício. Bonito, MS não tem hotel, de propósito. Dois hotéis estão esgotados.

Para ver loading, retry e error boundary: `GET /hotels?_delay=3000`, `GET /hotels/1?_fail=1`, ou `npm run server -- --fail-rate 0.2` dentro de `mock-api`. O cliente tenta de novo duas vezes em erro 500 e mostra um botão de retry.

## Fluxo

1. `/` — destino com autocomplete (`/suggestions`), datas e hóspedes. Vai para `/search` com a busca na query string.
2. `/search` — `GET /hotels` com preço, nota, tipo, comodidade, ordenação e página. O total vem de `X-Total-Count`.
3. `/hotel/[hotelId]` — hotel e quartos em paralelo. "Selecionar" grava a estadia no Zustand e abre o checkout.
4. `/checkout` — três passos. `POST /bookings`. Sem seleção, volta para a home.
5. `/confirmation/[bookingId]` — `GET /bookings/:id`. Funciona no reload.

Favoritos ficam em `/favorites`. As últimas reservas deste navegador ficam em `/reservas`.

Cupons locais, porque a API não tem endpoint de desconto: `ORLA10` (10% nas diárias) e `PRAIA50` (R$ 50 se as diárias somam pelo menos R$ 400).

## Decisões

**A URL é o estado da busca.** Filtro, ordenação e página são query params. Compartilhar é copiar o link. O Zustand não guarda a listagem: guarda o que precisa sobreviver a uma troca de rota (estadia escolhida, rascunho do checkout, favoritos, histórico de busca e de reserva).

**Quatro stores, um assunto cada.** Seleção e rascunho, favoritos, memória de busca, toasts. Toast não persiste. Cartão, CVV e documento não entram no `localStorage` nem no `POST`. O número do cartão só passa pelo Luhn no navegador. A API recebe hóspedes, datas, ids e o total.

**Hotel e confirmação no servidor, busca no cliente.** A página do hotel busca hotel e quartos em paralelo (`Promise.all`) e manda isso como `initialData` do TanStack Query, então o HTML já traz o conteúdo e o cache do cliente não refaz a request na hora. `generateMetadata` reutiliza a mesma função com `cache()` do React. Avaliações paginam no cliente, com skeleton próprio, para a ficha não esperar a lista de reviews. A confirmação é um Server Component: o `GET /bookings/:id` roda de novo em todo reload. A busca fica no cliente porque cada filtro muda a URL e o `keepPreviousData` evita apagar a grade enquanto a próxima página chega.

**Snapshot dentro da reserva.** O json-server não expande hotel nem quarto no `GET /bookings/:id`. O corpo do `POST` inclui um recorte (nome, foto, política, cotação) para a confirmação não depender de um segundo endpoint.

**Preço.** A API manda só a diária. O front calcula diárias × quartos, taxa de serviço de 10% e impostos de 5%. Está no README porque é premissa de produto, não dado da API.

**Comodidades.** `amenities_like` repetido é OU no json-server. A interface diz isso. Exigir todas no cliente quebraria a paginação do `X-Total-Count`, então não fiz AND.

**Datas.** Check-in a partir de hoje, no mínimo uma noite, no máximo 30. A comparação é em `YYYY-MM-DD` no fuso local, sem `Date` UTC, para não perder um dia.

## Avançados que entraram

Escolhi o que muda o uso real do fluxo, não a lista inteira.

- Home: debounce de 300ms, loading do autocomplete, validação enquanto preenche, rascunho e 5 últimas buscas no `localStorage`.
- Busca: filtros simultâneos, ordenação (menor preço, maior nota, mais popular), URL compartilhável, skeleton, vazio, paginação, retry e prefetch de hotel/quartos no hover do card.
- Hotel: lightbox com setas, escassez ("apenas N quartos"), esgotado, tabela que destaca o que difere, política de cancelamento expansível, mapa estático (OpenStreetMap), reviews paginadas, hotéis parecidos, breadcrumb, âncoras, compartilhar.
- Checkout: três passos, e-mail, telefone BR ou internacional, CPF ou passaporte, Luhn, validade, acompanhantes pelo número de adultos, cotação com breakdown, termos obrigatórios, cupom, erro de submit com retry.
- Confirmação no servidor, skeletons por rota, error boundary por rota e por seção (galeria, quartos, reviews), `console.error` estruturado em `[orla]`, toasts.
- Favoritos e histórico de reservas persistidos. Imagens com `next/image` e blur placeholder.

## O que ficou de fora

- Virtualização. A página tem 9 cards; o maior destino tem 14 hotéis.
- Ordenação por distância. Não há origem do usuário, só lat/long do hotel.
- Comparar até 3 hotéis de destinos diferentes. A comparação que existe é entre os quartos do mesmo hotel.
- i18n, PWA, offline, Framer Motion, mapa com chave de terceiros.
- Server Actions. A mutação oficial é o `POST` da mock-api; o TanStack Mutation segura o estado de erro e o retry na tela.
- Deploy. O front está pronto para a Vercel (`NEXT_PUBLIC_API_URL`). A API sobe com o `npm start` de `mock-api` (Render, Railway etc.), como o README de lá descreve.

## Uso de IA

Usei o Cursor para implementar o fluxo em cima do contrato da mock-api. As regras de data, documento e preço estão em funções puras com teste, para eu conseguir explicar o comportamento sem depender do que o modelo gerou na interface.
