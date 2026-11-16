"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROOM_AMENITY_LABEL } from "@/lib/constants";
import { formatBeds, formatBRL, roomsLabel } from "@/lib/format";
import type { Room } from "@/types/api";

function Scarcity({ available }: { available: number }) {
  if (available <= 0) {
    return <p className="text-sm font-medium text-clay">Esgotado</p>;
  }
  if (available <= 3) {
    return (
      <p className="text-sm font-medium text-clay">
        Apenas{" "}
        {available === 1
          ? "1 quarto disponível"
          : `${available} quartos disponíveis`}
        !
      </p>
    );
  }
  return <p className="text-sm text-muted">{available} quartos disponíveis</p>;
}

export function RoomList({
  rooms,
  adults,
  childCount,
  requestedRooms,
  canBook,
  onSelect,
}: {
  rooms: Room[];
  adults: number;
  childCount: number;
  requestedRooms: number;
  canBook: boolean;
  onSelect: (room: Room, roomCount: number) => void;
}) {
  const guests = adults + childCount;

  if (rooms.length === 0) {
    return (
      <p className="text-sm text-muted">Este hotel não publicou quartos.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {rooms.map((room) => (
        <RoomOption
          key={room.id}
          room={room}
          guests={guests}
          requestedRooms={requestedRooms}
          canBook={canBook}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function RoomOption({
  room,
  guests,
  requestedRooms,
  canBook,
  onSelect,
}: {
  room: Room;
  guests: number;
  requestedRooms: number;
  canBook: boolean;
  onSelect: (room: Room, roomCount: number) => void;
}) {
  const needed = Math.max(1, Math.ceil(guests / Math.max(room.maxGuests, 1)));
  const soldOut = room.available <= 0;
  const starting = soldOut
    ? 0
    : Math.min(room.available, Math.max(requestedRooms, needed));
  const [quantity, setQuantity] = useState(starting);
  const fits = !soldOut && quantity * room.maxGuests >= guests;
  const blockedByCapacity =
    !soldOut && room.available * room.maxGuests < guests;

  return (
    <li className="rounded-3xl border border-line bg-paper p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-2xl">{room.name}</h3>
          <p className="mt-1 max-w-xl text-sm text-muted">{room.description}</p>
          <p className="mt-2 text-sm">
            {room.size} m² · até {room.maxGuests} hóspedes ·{" "}
            {formatBeds(room.beds)}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {room.amenities.slice(0, 4).map((amenity) => (
              <li
                key={amenity}
                className="rounded-full bg-sand px-2 py-1 text-xs"
              >
                {ROOM_AMENITY_LABEL[amenity]}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Scarcity available={room.available} />
          </div>
        </div>
        <div className="min-w-44">
          <p className="font-medium">{formatBRL(room.pricePerNight)}</p>
          <p className="text-sm text-muted">por quarto / noite</p>
          {soldOut ? null : (
            <label className="mt-3 flex items-center gap-2 text-sm">
              Quantidade
              <select
                className="rounded-full border border-line bg-paper px-2 py-1"
                value={quantity}
                aria-label={`Quantidade de ${room.name}`}
                onChange={(event) => setQuantity(Number(event.target.value))}
              >
                {Array.from(
                  { length: room.available },
                  (_, index) => index + 1,
                ).map((value) => (
                  <option key={value} value={value}>
                    {roomsLabel(value)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {blockedByCapacity ? (
            <p className="mt-2 text-sm text-clay">
              Nem todos os quartos livres deste tipo cabem o grupo.
            </p>
          ) : null}
          {!soldOut && !fits && !blockedByCapacity ? (
            <p className="mt-2 text-sm text-clay">
              Aumente a quantidade para acomodar {guests} hóspedes.
            </p>
          ) : null}
          {!canBook ? (
            <p className="mt-2 text-sm text-muted">
              Defina datas válidas para selecionar.
            </p>
          ) : null}
          <Button
            className="mt-3 w-full"
            disabled={soldOut || !fits || !canBook}
            onClick={() => onSelect(room, quantity)}
          >
            Selecionar
          </Button>
        </div>
      </div>
    </li>
  );
}
