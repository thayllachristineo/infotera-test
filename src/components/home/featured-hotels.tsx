"use client";

import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/layout/container";
import { HotelCard } from "@/components/search/hotel-card";
import { HotelCardSkeleton } from "@/components/search/skeletons";
import { ErrorState } from "@/components/ui/status";
import { listFeatured } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

export function FeaturedHotels() {
  const featured = useQuery({
    queryKey: queryKeys.featured,
    queryFn: listFeatured,
  });

  return (
    <section className="py-14" aria-labelledby="destaques">
      <Container>
        <h2 id="destaques" className="font-display text-3xl">
          Em destaque
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Uma amostra do catálogo. A busca completa começa pelo destino.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.isLoading
            ? [0, 1, 2, 3].map((item) => <HotelCardSkeleton key={item} />)
            : null}
          {featured.isError ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <ErrorState
                title="Os destaques não carregaram"
                message={
                  featured.error instanceof Error
                    ? featured.error.message
                    : undefined
                }
                onRetry={() => void featured.refetch()}
              />
            </div>
          ) : null}
          {featured.data?.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} criteria={null} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HomeSteps() {
  const steps = [
    {
      title: "Busque",
      text: "Destino com autocomplete, datas válidas e número de hóspedes.",
    },
    {
      title: "Compare",
      text: "Filtre preço, nota, tipo e comodidades. O link guarda a escolha.",
    },
    {
      title: "Reserve",
      text: "Escolha o quarto, confira o total e confirme. O número da reserva sobrevive ao reload.",
    },
  ];

  return (
    <section
      className="border-b border-line py-12"
      aria-labelledby="como-funciona"
    >
      <Container>
        <h2 id="como-funciona" className="font-display text-3xl">
          Como funciona
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-3xl border border-line bg-paper p-5"
            >
              <p className="text-sm text-clay">0{index + 1}</p>
              <h3 className="mt-2 font-display text-2xl">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
