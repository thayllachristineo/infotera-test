import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SIZE } from "@/lib/constants";

/** Espelha o card da busca: foto, favorito, tipo, nome, nota, avaliações e diária. */
export function HotelCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper"
      aria-hidden="true"
    >
      <div className="relative aspect-[4/3]">
        <Skeleton className="h-full w-full rounded-none" />
        <span className="absolute top-3 right-3 h-10 w-10 rounded-full bg-paper/95" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <div className="mt-auto pt-3">
          <Skeleton className="h-5 w-36" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only">Carregando hotéis</p>
      <Skeleton className="mb-4 h-5 w-24" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from(
          { length: PAGE_SIZE },
          (_, index) => `slot-${index + 1}`,
        ).map((slot) => (
          <HotelCardSkeleton key={slot} />
        ))}
      </div>
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <Container className="py-8">
      <Skeleton className="mb-6 h-28 w-full" />
      <SearchResultsSkeleton />
    </Container>
  );
}
