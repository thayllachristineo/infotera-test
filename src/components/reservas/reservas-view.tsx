"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/status";
import { formatBRL, formatDateBR } from "@/lib/format";
import { useBookingStore } from "@/stores/booking-store";

export function ReservasView() {
  const hydrated = useBookingStore((state) => state.hydrated);
  const history = useBookingStore((state) => state.history);

  return (
    <Container className="py-10">
      <h1 className="font-display text-4xl">Reservas neste navegador</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        A lista fica no seu navegador. A reserva em si é lida de novo na API
        quando você abre a confirmação. Se a mock-api reiniciar, o banco volta
        ao início e o número antigo deixa de existir.
      </p>
      {!hydrated ? (
        <p className="mt-8 text-sm text-muted">Carregando reservas...</p>
      ) : null}
      {hydrated && history.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nenhuma reserva ainda"
            message="Quando você confirmar uma estadia, o número aparece aqui."
            action={
              <Link href="/">
                <Button>Nova busca</Button>
              </Link>
            }
          />
        </div>
      ) : null}
      {hydrated && history.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-3">
          {history.map((item) => (
            <li
              key={item.id}
              className="rounded-3xl border border-line bg-paper p-4 sm:flex sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm text-muted">Reserva {item.id}</p>
                <h2 className="font-display text-2xl">{item.hotelName}</h2>
                <p className="text-sm text-muted">
                  {item.destination} · {formatDateBR(item.checkIn)} —{" "}
                  {formatDateBR(item.checkOut)}
                </p>
                <p className="mt-1 text-sm">{formatBRL(item.totalPrice)}</p>
              </div>
              <Link
                href={`/confirmation/${item.id}`}
                className="mt-3 inline-block sm:mt-0"
              >
                <Button variant="secondary">Ver confirmação</Button>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Container>
  );
}
