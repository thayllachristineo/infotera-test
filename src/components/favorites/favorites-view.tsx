"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/status";
import { formatBRL } from "@/lib/format";
import { IMAGE_BLUR } from "@/lib/images";
import { useFavoritesStore } from "@/stores/favorites-store";

export function FavoritesView() {
  const hydrated = useFavoritesStore((state) => state.hydrated);
  const items = useFavoritesStore((state) => state.items);

  return (
    <Container className="py-10">
      <h1 className="font-display text-4xl">Favoritos</h1>
      <p className="mt-2 text-sm text-muted">
        Salvos neste navegador. Eles continuam aqui se você fechar a aba.
      </p>
      {!hydrated ? (
        <p className="mt-8 text-sm text-muted">Carregando favoritos...</p>
      ) : null}
      {hydrated && items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nenhum hotel salvo"
            message="Use o coração nos cards para guardar hotéis e voltar neles depois."
            action={
              <Link href="/">
                <Button>Buscar hotéis</Button>
              </Link>
            }
          />
        </div>
      ) : null}
      {hydrated && items.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((hotel) => (
            <li
              key={hotel.id}
              className="overflow-hidden rounded-3xl border border-line bg-paper"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={hotel.thumbnail}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR}
                />
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl">
                  <Link href={`/hotel/${hotel.id}`} className="hover:underline">
                    {hotel.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-muted">{hotel.destination}</p>
                <p className="mt-2 text-sm">
                  {formatBRL(hotel.pricePerNight)} / noite
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => useFavoritesStore.getState().remove(hotel.id)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Container>
  );
}
