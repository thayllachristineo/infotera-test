"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Gallery } from "@/components/hotel/gallery";
import { Reviews } from "@/components/hotel/reviews";
import { RoomComparison } from "@/components/hotel/room-comparison";
import { RoomList } from "@/components/hotel/room-list";
import { Container } from "@/components/layout/container";
import { HotelCard } from "@/components/search/hotel-card";
import { SearchPanel } from "@/components/search/search-panel";
import { Icon } from "@/components/ui/icon";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { StarRating } from "@/components/ui/star-rating";
import { getHotel, getRooms, listSimilar } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { AMENITY_LABEL, CANCELLATION_COPY } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { formatBRL, guestsLabel } from "@/lib/format";
import {
  buildHotelHref,
  buildSearchHref,
  isSearchReady,
  parseSearchState,
} from "@/lib/search-params";
import { useBookingStore } from "@/stores/booking-store";
import { pushToast } from "@/stores/toast-store";
import type { CancellationPolicy, Hotel, Room } from "@/types/api";
import type { SearchCriteria } from "@/types/search";

function Cancellation({ policy }: { policy: CancellationPolicy }) {
  const [open, setOpen] = useState(false);
  const copy = CANCELLATION_COPY[policy];
  return (
    <div className="rounded-3xl border border-line bg-paper p-4">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>
          <span className="block font-medium">{copy.title}</span>
          <span className="mt-1 block text-sm text-muted">{copy.summary}</span>
        </span>
        <span className="text-sm text-pine">
          {open ? "Ocultar" : "Ler política"}
        </span>
      </button>
      {open ? (
        <p className="mt-3 text-sm leading-6 text-muted">{copy.details}</p>
      ) : null}
    </div>
  );
}

function HotelMap({ hotel }: { hotel: Hotel }) {
  const delta = 0.02;
  const bbox = [
    hotel.longitude - delta,
    hotel.latitude - delta,
    hotel.longitude + delta,
    hotel.latitude + delta,
  ].join("%2C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${hotel.latitude}%2C${hotel.longitude}`;
  return (
    <div>
      <iframe
        title={`Mapa de ${hotel.name}`}
        src={src}
        className="h-72 w-full rounded-3xl border border-line"
        loading="lazy"
      />
      <p className="mt-2 text-sm text-muted">{hotel.address}</p>
      <a
        className="mt-1 inline-block text-sm text-pine underline"
        href={`https://www.openstreetmap.org/?mlat=${hotel.latitude}&mlon=${hotel.longitude}#map=15/${hotel.latitude}/${hotel.longitude}`}
        target="_blank"
        rel="noreferrer"
      >
        Abrir no OpenStreetMap
      </a>
    </div>
  );
}

/**
 * Dados do hotel e dos quartos chegam do servidor. Interação (galeria,
 * escolha, avaliações) fica neste client component.
 */
export function HotelDetail({
  initialHotel,
  initialRooms,
}: {
  initialHotel: Hotel;
  initialRooms: Room[];
}) {
  const router = useRouter();
  const raw = useSearchParams();
  const parsed = useMemo(
    () => parseSearchState(new URLSearchParams(raw.toString()), todayISO()),
    [raw],
  );
  const criteria: SearchCriteria = {
    ...parsed.criteria,
    destination: parsed.criteria.destination || initialHotel.destination,
  };
  const canBook = parsed.dateIssues.length === 0;

  const hotelQuery = useQuery({
    queryKey: queryKeys.hotel(initialHotel.id),
    queryFn: () => getHotel(initialHotel.id),
    initialData: initialHotel,
    staleTime: 60_000,
  });
  const roomsQuery = useQuery({
    queryKey: queryKeys.rooms(initialHotel.id),
    queryFn: () => getRooms(initialHotel.id),
    initialData: initialRooms,
    staleTime: 60_000,
  });
  const similar = useQuery({
    queryKey: queryKeys.similar(initialHotel.destination),
    queryFn: () => listSimilar(initialHotel.destination),
  });

  const hotel = hotelQuery.data;
  const rooms = roomsQuery.data;
  const suggestions = (similar.data ?? [])
    .filter((item) => item.id !== hotel.id)
    .slice(0, 3);

  function selectRoom(room: Room, roomCount: number) {
    if (!canBook) return;
    useBookingStore.getState().select({
      hotel: {
        id: hotel.id,
        name: hotel.name,
        destination: hotel.destination,
        address: hotel.address,
        thumbnail: hotel.thumbnail,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        checkInTime: hotel.checkInTime,
        checkOutTime: hotel.checkOutTime,
        cancellationPolicy: hotel.cancellationPolicy,
        amenities: hotel.amenities,
      },
      room: {
        id: room.id,
        name: room.name,
        description: room.description,
        pricePerNight: room.pricePerNight,
        maxGuests: room.maxGuests,
        size: room.size,
        available: room.available,
        image: room.images[0] ?? null,
        beds: room.beds,
      },
      roomCount,
      checkIn: criteria.checkIn,
      checkOut: criteria.checkOut,
      adults: criteria.adults,
      children: criteria.children,
    });
    router.push("/checkout");
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: hotel.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      pushToast({ title: "Link do hotel copiado", tone: "success" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      pushToast({ title: "Não foi possível compartilhar", tone: "error" });
    }
  }

  const searchHref = isSearchReady(criteria, parsed.dateIssues)
    ? buildSearchHref(criteria)
    : buildSearchHref({
        ...criteria,
        ...{ checkIn: criteria.checkIn, checkOut: criteria.checkOut },
      });

  return (
    <div>
      <Container className="py-6">
        <nav aria-label="Trilha" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:underline">
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={searchHref} className="hover:underline">
                Busca
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {hotel.name}
            </li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl leading-tight">
              {hotel.name}
            </h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted">
              <Icon name="pin" className="h-4 w-4" />
              {hotel.destination}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StarRating value={hotel.rating} />
              <a href="#avaliacoes" className="text-sm underline">
                {hotel.reviewCount} avaliações
              </a>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted">a partir de</p>
            <p className="font-display text-3xl">
              {formatBRL(hotel.pricePerNight)}
            </p>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 text-sm"
              onClick={() => void share()}
            >
              <Icon name="share" className="h-4 w-4" />
              Compartilhar
            </button>
          </div>
        </div>

        <nav
          aria-label="Seções do hotel"
          className="sticky top-16 z-20 mt-6 -mx-4 border-y border-line bg-sand/95 px-4 backdrop-blur"
        >
          <ul className="flex gap-4 overflow-auto py-3 text-sm">
            <li>
              <a className="whitespace-nowrap" href="#visao-geral">
                Visão geral
              </a>
            </li>
            <li>
              <a className="whitespace-nowrap" href="#quartos">
                Quartos
              </a>
            </li>
            <li>
              <a className="whitespace-nowrap" href="#local">
                Localização
              </a>
            </li>
            <li>
              <a className="whitespace-nowrap" href="#avaliacoes">
                Avaliações
              </a>
            </li>
          </ul>
        </nav>

        <div className="mt-6">
          <SectionBoundary title="a galeria">
            <Gallery images={hotel.images} name={hotel.name} />
          </SectionBoundary>
        </div>

        <section
          id="visao-geral"
          className="scroll-mt-32 mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
        >
          <div>
            <h2 className="font-display text-2xl">Sobre</h2>
            <p className="mt-3 max-w-2xl leading-7">{hotel.description}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {hotel.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="rounded-full bg-foam px-3 py-1 text-sm"
                >
                  {AMENITY_LABEL[amenity]}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              Check-in {hotel.checkInTime} · Check-out {hotel.checkOutTime}
            </p>
            <div className="mt-4">
              <Cancellation policy={hotel.cancellationPolicy} />
            </div>
          </div>
          <aside className="h-fit rounded-3xl border border-line bg-paper p-4 lg:sticky lg:top-36">
            <h2 className="font-display text-xl">Sua estadia</h2>
            <p className="mt-1 text-sm text-muted">
              {canBook
                ? guestsLabel(criteria.adults, criteria.children)
                : "Informe as datas para escolher um quarto."}
            </p>
            <div className="mt-3">
              <SearchPanel
                variant="bar"
                initial={criteria}
                onSubmit={(values) => {
                  if (values.destination !== hotel.destination) {
                    router.push(buildSearchHref(values));
                    return;
                  }
                  router.replace(buildHotelHref(hotel.id, values), {
                    scroll: false,
                  });
                }}
              />
            </div>
          </aside>
        </section>

        <section id="quartos" className="scroll-mt-32 mt-12">
          <h2 className="font-display text-3xl">Quartos</h2>
          {hotel.availableRooms === 0 ? (
            <p
              className="mt-2 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay"
              aria-live="polite"
            >
              Hotel esgotado nas datas do catálogo. Os quartos abaixo não podem
              ser selecionados.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">
              {hotel.availableRooms} quartos livres somando todos os tipos.
            </p>
          )}
          <div className="mt-4">
            <SectionBoundary title="os quartos">
              <RoomList
                rooms={rooms}
                adults={criteria.adults}
                childCount={criteria.children}
                requestedRooms={criteria.rooms}
                canBook={canBook}
                onSelect={selectRoom}
              />
              <RoomComparison rooms={rooms} />
            </SectionBoundary>
          </div>
        </section>

        <section id="local" className="scroll-mt-32 mt-12">
          <h2 className="font-display text-3xl">Localização</h2>
          <div className="mt-4">
            <HotelMap hotel={hotel} />
          </div>
        </section>

        <section id="avaliacoes" className="scroll-mt-32 mt-12">
          <h2 className="font-display text-3xl">Avaliações</h2>
          <div className="mt-4 max-w-3xl">
            <SectionBoundary title="as avaliações">
              <Reviews hotelId={hotel.id} />
            </SectionBoundary>
          </div>
        </section>

        {suggestions.length > 0 ? (
          <section className="mt-12" aria-labelledby="parecidos">
            <h2 id="parecidos" className="font-display text-3xl">
              Também em {hotel.destination}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((item) => (
                <HotelCard
                  key={item.id}
                  hotel={item}
                  criteria={canBook ? criteria : null}
                />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
