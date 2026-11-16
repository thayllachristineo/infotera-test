"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/layout/container";
import { SearchPanel } from "@/components/search/search-panel";
import { getSuggestions } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { SUGGESTION_LABEL } from "@/lib/constants";
import { defaultStay } from "@/lib/dates";
import { IMAGE_BLUR } from "@/lib/images";
import { buildSearchHref, EMPTY_CRITERIA } from "@/lib/search-params";
import { matchesDestination } from "@/lib/text";
import type { Suggestion } from "@/types/api";

function DestinationShortcuts({
  suggestions,
  onPick,
}: {
  suggestions: Suggestion[];
  onPick: (name: string) => void;
}) {
  if (suggestions.length === 0) {
    return (
      <p className="mt-2 text-sm text-sand/80">Nenhum destino encontrado</p>
    );
  }

  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <li key={suggestion.id}>
          <button
            type="button"
            className="rounded-full bg-paper/10 px-3 py-1.5 text-sm text-paper ring-1 ring-paper/25 hover:bg-paper/20"
            onClick={() => onPick(suggestion.name)}
          >
            {suggestion.name}
            <span className="text-sand/80">
              {" · "}
              {SUGGESTION_LABEL[suggestion.type]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function HomeHero() {
  const router = useRouter();
  const [destinationQuery, setDestinationQuery] = useState("");
  const suggestions = useQuery({
    queryKey: queryKeys.suggestions(""),
    queryFn: () => getSuggestions(""),
    staleTime: 300_000,
  });

  return (
    <section className="relative isolate">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/55 to-ink/80" />
      </div>
      <Container className="relative z-10 py-16 sm:py-24">
        <p className="text-xs tracking-[0.22em] text-sand/80 uppercase">Orla</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-paper sm:text-6xl">
          Onde a próxima estadia começa.
        </h1>
        <p className="mt-4 max-w-xl text-base text-sand/90 sm:text-lg">
          Escolha o destino, as datas e quem viaja. O preço da reserva fecha com
          diárias, taxa e impostos antes da confirmação.
        </p>
        <div className="mt-8 max-w-5xl">
          <SearchPanel
            variant="hero"
            onDestinationTextChange={setDestinationQuery}
          />
        </div>
        <div className="mt-6">
          <h2 className="text-sm text-sand/80">Destinos</h2>
          {suggestions.isLoading ? (
            <p className="mt-2 text-sm text-sand/80">Carregando destinos...</p>
          ) : null}
          {suggestions.isError ? (
            <p className="mt-2 text-sm text-sand">
              Não foi possível carregar os destinos.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => void suggestions.refetch()}
              >
                Tentar de novo
              </button>
            </p>
          ) : null}
          {suggestions.data ? (
            <DestinationShortcuts
              suggestions={suggestions.data.filter((suggestion) =>
                matchesDestination(suggestion, destinationQuery),
              )}
              onPick={(name) => {
                const stay = defaultStay();
                router.push(
                  buildSearchHref({
                    ...EMPTY_CRITERIA,
                    destination: name,
                    ...stay,
                    adults: 2,
                  }),
                );
              }}
            />
          ) : null}
        </div>
      </Container>
    </section>
  );
}
