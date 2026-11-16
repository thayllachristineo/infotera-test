import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function BookingNotFound() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">Reserva não encontrada</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Esse número não está na API. Se o servidor da mock-api reiniciou, as
        reservas anteriores foram apagadas.
      </p>
      <Link href="/reservas" className="mt-6 inline-block">
        <Button variant="secondary">Ver reservas deste navegador</Button>
      </Link>
    </Container>
  );
}
