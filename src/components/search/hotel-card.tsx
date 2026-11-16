"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { StarRating } from "@/components/ui/star-rating";
import { getHotel, getRooms } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { PROPERTY_LABEL } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import { IMAGE_BLUR } from "@/lib/images";
import { getQueryClient } from "@/lib/query-client";
import { buildHotelHref } from "@/lib/search-params";
import { useFavoritesStore } from "@/stores/favorites-store";
import { pushToast } from "@/stores/toast-store";
import type { Hotel } from "@/types/api";
import type { FavoriteHotel } from "@/types/booking";
import type { SearchCriteria } from "@/types/search";

function prefetchHotel(id: number) {
  const client = getQueryClient();
  void client.prefetchQuery({
    queryKey: queryKeys.hotel(id),
    queryFn: () => getHotel(id),
    staleTime: 60_000,
  });
  void client.prefetchQuery({
    queryKey: queryKeys.rooms(id),
    queryFn: () => getRooms(id),
    staleTime: 60_000,
  });
}

export function toFavorite(
  hotel: Pick<
    Hotel,
    | "id"
    | "name"
    | "destination"
    | "thumbnail"
    | "pricePerNight"
    | "rating"
    | "propertyType"
  >,
): FavoriteHotel {
  return {
    id: hotel.id,
    name: hotel.name,
    destination: hotel.destination,
    thumbnail: hotel.thumbnail,
    pricePerNight: hotel.pricePerNight,
    rating: hotel.rating,
    propertyType: hotel.propertyType,
  };
}

export function HotelCard({
  hotel,
  criteria,
}: {
  hotel: Hotel;
  criteria: SearchCriteria | null;
}) {
  const href = criteria
    ? buildHotelHref(hotel.id, criteria)
    : `/hotel/${hotel.id}`;
  const saved = useFavoritesStore((state) =>
    state.items.some((item) => item.id === hotel.id),
  );
  const soldOut = hotel.availableRooms === 0;

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper"
      onMouseEnter={() => prefetchHotel(hotel.id)}
      onFocus={() => prefetchHotel(hotel.id)}
    >
      <div className="relative aspect-[4/3] bg-line">
        <Image
          src={hotel.thumbnail}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR}
        />
        <Link href={href} className="absolute inset-0 z-10">
          <span className="sr-only">Ver {hotel.name}</span>
        </Link>
        <button
          type="button"
          className="absolute top-3 right-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-paper/95 text-clay"
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remover ${hotel.name} dos favoritos`
              : `Salvar ${hotel.name}`
          }
          onClick={() => {
            const added = useFavoritesStore
              .getState()
              .toggle(toFavorite(hotel));
            pushToast({
              title: added ? "Salvo nos favoritos" : "Removido dos favoritos",
              tone: "success",
            });
          }}
        >
          <Icon name={saved ? "heart-filled" : "heart"} />
        </button>
        {soldOut ? (
          <span className="absolute bottom-3 left-3 z-20 rounded-full bg-ink px-3 py-1 text-xs text-paper">
            Esgotado
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs tracking-wide text-muted uppercase">
          {PROPERTY_LABEL[hotel.propertyType]} · {hotel.destination}
        </p>
        <h2 className="font-display text-xl leading-tight">
          <Link href={href} className="hover:underline">
            {hotel.name}
          </Link>
        </h2>
        <StarRating value={hotel.rating} />
        <p className="text-sm text-muted">{hotel.reviewCount} avaliações</p>
        <p className="mt-auto pt-3 text-sm">
          <span className="font-medium">{formatBRL(hotel.pricePerNight)}</span>
          <span className="text-muted"> / noite</span>
        </p>
      </div>
    </article>
  );
}
