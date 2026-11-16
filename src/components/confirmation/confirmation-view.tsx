import Image from "next/image";
import Link from "next/link";
import { PriceSummary } from "@/components/checkout/price-summary";
import { ClearSelection } from "@/components/confirmation/clear-selection";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CANCELLATION_COPY } from "@/lib/constants";
import { formatBRL, formatDateBR, guestsLabel, roomsLabel } from "@/lib/format";
import { IMAGE_BLUR } from "@/lib/images";
import type { Booking } from "@/types/api";

export function ConfirmationView({ booking }: { booking: Booking }) {
  const { snapshot } = booking;
  const primary = booking.guests[0];

  return (
    <Container className="py-10">
      <ClearSelection />
      <p className="text-sm tracking-[0.18em] text-pine uppercase">
        Reserva confirmada
      </p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">
        Número {booking.id}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Guarde esse número. Se você recarregar a página, a reserva é lida de
        novo na API.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          {snapshot.thumbnail ? (
            <Image
              src={snapshot.thumbnail}
              alt=""
              fill
              sizes="320px"
              className="object-cover"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR}
            />
          ) : (
            <div className="h-full bg-line" />
          )}
        </div>
        <div className="rounded-3xl border border-line bg-paper p-5">
          <h2 className="font-display text-3xl">
            {snapshot.hotelName || "Hotel"}
          </h2>
          <p className="mt-1 text-sm text-muted">{snapshot.destination}</p>
          <p className="mt-1 text-sm">{snapshot.address}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Quarto</dt>
              <dd>{snapshot.roomName}</dd>
            </div>
            <div>
              <dt className="text-muted">Quantidade</dt>
              <dd>{roomsLabel(booking.rooms)}</dd>
            </div>
            <div>
              <dt className="text-muted">Check-in</dt>
              <dd>
                {formatDateBR(booking.checkIn)} · {snapshot.checkInTime}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Check-out</dt>
              <dd>
                {formatDateBR(booking.checkOut)} · {snapshot.checkOutTime}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Hóspedes</dt>
              <dd>{guestsLabel(booking.adults, booking.children)}</dd>
            </div>
            <div>
              <dt className="text-muted">Cancelamento</dt>
              <dd>{CANCELLATION_COPY[snapshot.cancellationPolicy].summary}</dd>
            </div>
          </dl>
          {primary ? (
            <p className="mt-4 text-sm">
              Hóspede principal: {primary.firstName} {primary.lastName}
              {primary.email ? ` · ${primary.email}` : ""}
            </p>
          ) : null}
          {booking.guests.length > 1 ? (
            <ul className="mt-2 text-sm text-muted">
              {booking.guests.slice(1).map((guest) => (
                <li key={`${guest.firstName}-${guest.lastName}`}>
                  {guest.firstName} {guest.lastName}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-5 max-w-md">
            <PriceSummary quote={snapshot.quote} />
            <p className="mt-2 text-xs text-muted">
              Total registrado: {formatBRL(booking.totalPrice)}
            </p>
          </div>
          <Link href="/" className="mt-6 inline-block">
            <Button>Nova busca</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
