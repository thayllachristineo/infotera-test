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

Não há `localhost` fixo no código. Em produção, `NEXT_PUBLIC_API_URL` aponta para a API publicada, sem barra no final.

A mock-api recria `db.json` a partir de `db.seed.json` a cada start. Reservas somem no reinício. Bonito, MS não tem hotel, de propósito. Dois hotéis estão esgotados.

Para ver loading, retry e error boundary: `GET /hotels?_delay=3000`, `GET /hotels/1?_fail=1`, ou `npm run server -- --fail-rate 0.2` dentro de `mock-api`. O cliente tenta de novo duas vezes em erro 500 e mostra um botão de retry.

## Fluxo

1. `/` — destino com autocomplete (`/suggestions`), datas e hóspedes. Vai para `/search` com a busca na query string.
2. `/search` — `GET /hotels` com preço, nota, tipo, comodidade, ordenação e página. O total vem de `X-Total-Count`.
3. `/hotel/[hotelId]` — hotel e quartos em paralelo. "Selecionar" grava a estadia no Zustand e abre o checkout.
4. `/checkout` — três passos. A confirmação chama a Server Action `createBookingAction`, que recalcula a cotação e só então faz `POST /bookings`. Sem seleção, volta para a home. "Ler o texto completo" abre o modal de termos; o endereço direto é `/checkout/termos`.
5. `/confirmation/[bookingId]` — `GET /bookings/:id`. Funciona no reload.

Favoritos ficam em `/favorites`. As últimas reservas deste navegador ficam em `/reservas`.

Cupons locais, porque a API não tem endpoint de desconto: `ORLA10` (10% nas diárias) e `PRAIA50` (R$ 50 se as diárias somam pelo menos R$ 400).

## Decisões

**A URL é o estado da busca.** Filtro, ordenação e página são query params. Compartilhar é copiar o link. O Zustand não guarda a listagem: guarda o que precisa sobreviver a uma troca de rota (estadia escolhida, rascunho do checkout, favoritos, histórico de busca e de reserva).

**Quatro stores, um assunto cada.** Seleção e rascunho, favoritos, memória de busca, toasts. Toast não persiste. Cartão, CVV e documento não entram no `localStorage` nem no `POST`. O número do cartão só passa pelo Luhn no navegador. A API recebe hóspedes, datas, ids e o total.

**Hotel e confirmação no servidor, busca no cliente.** A página do hotel busca hotel e quartos em paralelo e entrega isso como `initialData` do TanStack Query, então o HTML já traz o conteúdo e o cliente não refaz a request na hora. Avaliações paginam no cliente, com skeleton próprio, para a ficha não esperar a lista de reviews. A confirmação lê a reserva no servidor a cada visita, dentro de um Suspense, para o número não ficar preso no cache. A busca fica no cliente porque cada filtro muda a URL e o `keepPreviousData` evita apagar a grade enquanto a próxima página chega.

**Server Action na reserva.** O navegador não monta o `POST`. A action valida o corpo com Zod, recalcula noites e total a partir da diária e do cupom, e descarta cartão, CVV e documento porque esses campos não estão no schema. O TanStack Mutation só guarda o estado de erro e o botão de tentar de novo.

**Cache do Next.** `cacheComponents` liga o Partial Prerendering: home, busca e checkout entregam o casco estático, e o miolo que depende de dados fica num Suspense. O catálogo do hotel usa `use cache` com vida de minutos (`getHotelCatalog` e `getRoomsCatalog`), então a ficha revalida sem um rebuild. Hotéis 1, 2 e 3 saem de `generateStaticParams`. O middleware em `/api/sugestoes` roda na borda e repassa `q` para `/suggestions` da mock-api; o autocomplete da tela continua chamando a API direto.

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
- Next.js: Partial Prerendering, ISR do catálogo, Server Action na reserva, rota paralela para o modal de termos e middleware na borda para sugestões. Esses pontos deixam o HTML estático onde a página não muda por visitante e mantêm a reserva fora do cache.

## Deploy

Os dois projetos estão na Vercel, a partir deste repositório.

- Front: [https://infotera-test-front.vercel.app](https://infotera-test-front.vercel.app)
- API: [https://infotera-test.vercel.app](https://infotera-test.vercel.app)

O front usa a raiz do repositório e `NEXT_PUBLIC_API_URL=https://infotera-test.vercel.app`. A API usa a raiz `mock-api`, build `npm install` e start `npm start`, como na seção "Hospedando a API" de [`mock-api/README.md`](mock-api/README.md). As reservas somem quando a API reinicia.

## O que ficou de fora

- Virtualização. A página tem 9 cards; o maior destino tem 14 hotéis.
- Ordenação por distância. Não há origem do usuário, só lat/long do hotel.
- Comparar até 3 hotéis de destinos diferentes. A comparação que existe é entre os quartos do mesmo hotel.
- i18n, PWA, offline, Framer Motion, mapa com chave de terceiros.

## Uso de IA

Usei o Cursor durante a implementação. O modelo escreveu o fluxo em cima do contrato da mock-api, os testes, os ajustes de layout e este README. Eu definia o que entrava, revisava a tela e pedia a correção quando o resultado não batia com o pedido. As regras de data, documento e preço ficaram em funções puras com teste, para eu conseguir explicar o comportamento sem depender do que foi gerado na interface.
