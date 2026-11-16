"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Container } from "@/components/layout/container";
import { HotelCard } from "@/components/search/hotel-card";
import { Pagination } from "@/components/search/pagination";
import { SearchFilters, SortSelect } from "@/components/search/search-filters";
import { SearchPanel } from "@/components/search/search-panel";
import { SearchResultsSkeleton } from "@/components/search/skeletons";
import { Button } from "@/components/ui/button";
import { PendingBar } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/status";
import { listHotels } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { PAGE_SIZE } from "@/lib/constants";
import { nightsBetween, todayISO } from "@/lib/dates";
import {
  formatDateBR,
  guestsLabel,
  nightsLabel,
  roomsLabel,
} from "@/lib/format";
import {
  buildSearchHref,
  EMPTY_FILTERS,
  filtersAreActive,
  isSearchReady,
  parseSearchState,
} from "@/lib/search-params";
import { pushToast } from "@/stores/toast-store";
import type {
  SearchFilters as HotelSearchFilters,
  SearchCriteria,
} from "@/types/search";

/**
 * A URL é a fonte dos filtros. Um link copiado reabre a mesma busca.
 */
export function SearchExperience() {
  const router = useRouter();
  const raw = useSearchParams();
  const params = useMemo(() => new URLSearchParams(raw.toString()), [raw]);
  const today = todayISO();
  const parsed = useMemo(
    () => parseSearchState(params, today),
    [params, today],
  );
  const { criteria, filters, dateIssues } = parsed;
  const ready = isSearchReady(criteria, dateIssues);

  const results = useQuery({
    queryKey: queryKeys.hotelList(criteria, filters),
    queryFn: () => listHotels(criteria, filters),
    enabled: ready,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!results.data) return;
    const pages = Math.max(1, Math.ceil(results.data.total / PAGE_SIZE));
    if (filters.page > pages) {
      router.replace(buildSearchHref(criteria, { ...filters, page: pages }), {
        scroll: false,
      });
    }
  }, [results.data, filters, criteria, router]);

  function push(nextCriteria: SearchCriteria, nextFilters: HotelSearchFilters) {
    router.push(buildSearchHref(nextCriteria, nextFilters), { scroll: false });
  }

  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const pages = results.data
    ? Math.max(1, Math.ceil(results.data.total / PAGE_SIZE))
    : 1;

  return (
    <div>
      <div className="border-b border-line bg-sand/80">
        <Container className="py-4">
          <SearchPanel
            variant="bar"
            initial={criteria.destination ? criteria : undefined}
          />
        </Container>
      </div>
      <PendingBar active={results.isFetching} />
      <Container className="py-8">
        {!ready ? (
          <EmptyState
            title="Complete a busca"
            message={
              dateIssues[0]?.message ??
              "Escolha um destino da lista e as datas da estadia."
            }
          />
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl">
                  Hotéis em {criteria.destination}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  {formatDateBR(criteria.checkIn)} —{" "}
                  {formatDateBR(criteria.checkOut)}
                  {nights ? ` · ${nightsLabel(nights)}` : ""} ·{" "}
                  {roomsLabel(criteria.rooms)} ·{" "}
                  {guestsLabel(criteria.adults, criteria.children)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SortSelect
                  value={filters.sort}
                  onChange={(sort) =>
                    push(criteria, { ...filters, sort, page: 1 })
                  }
                />
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      pushToast({
                        title: "Link da busca copiado",
                        tone: "success",
                      });
                    } catch {
                      pushToast({
                        title: "Não foi possível copiar o link",
                        tone: "error",
                      });
                    }
                  }}
                >
                  Compartilhar
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
              <SearchFilters
                filters={filters}
                onChange={(partial) =>
                  push(criteria, {
                    ...filters,
                    ...partial,
                    page: partial.page ?? 1,
                  })
                }
                onClear={() => push(criteria, { ...EMPTY_FILTERS })}
              />
              <div id="resultados">
                {results.isLoading ? <SearchResultsSkeleton /> : null}
                {results.isError && !results.data ? (
                  <ErrorState
                    title="A busca falhou"
                    message={
                      results.error instanceof Error
                        ? results.error.message
                        : "Erro inesperado"
                    }
                    onRetry={() => void results.refetch()}
                  />
                ) : null}
                {results.isError && results.data ? (
                  <p role="alert" className="mb-4 text-sm text-clay">
                    Não foi possível atualizar a lista.{" "}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => void results.refetch()}
                    >
                      Tentar de novo
                    </button>
                  </p>
                ) : null}
                {results.data && results.data.hotels.length === 0 ? (
                  filtersAreActive(filters) ? (
                    <EmptyState
                      title="Nenhum hotel encontrado"
                      message={`Nenhum hotel em ${criteria.destination} combina com esses filtros.`}
                      action={
                        <Button
                          variant="secondary"
                          onClick={() => push(criteria, EMPTY_FILTERS)}
                        >
                          Limpar filtros
                        </Button>
                      }
                    />
                  ) : (
                    <EmptyState
                      title="Nenhum hotel neste destino"
                      message={`${criteria.destination} está na lista, mas não há hotéis disponíveis para reservar.`}
                    />
                  )
                ) : null}
                {results.data && results.data.hotels.length > 0 ? (
                  <>
                    <p className="mb-4 text-sm text-muted" aria-live="polite">
                      {results.data.total}{" "}
                      {results.data.total === 1 ? "hotel" : "hotéis"}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {results.data.hotels.map((hotel) => (
                        <HotelCard
                          key={hotel.id}
                          hotel={hotel}
                          criteria={criteria}
                        />
                      ))}
                    </div>
                    <Pagination
                      page={filters.page}
                      pages={pages}
                      onPage={(page) => {
                        push(criteria, { ...filters, page });
                        document.getElementById("resultados")?.scrollIntoView();
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
