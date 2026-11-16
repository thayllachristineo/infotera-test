import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function HotelNotFound() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">Hotel não encontrado</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Esse identificador não existe na mock-api. Volte para a busca e escolha
        outro hotel.
      </p>
      <Link href="/" className="mt-6 inline-block">
        <Button>Nova busca</Button>
      </Link>
    </Container>
  );
}
