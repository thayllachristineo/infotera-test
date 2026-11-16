import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">Página não encontrada</h1>
      <p className="mt-3 text-sm text-muted">
        O endereço não corresponde a nenhuma tela da Orla.
      </p>
      <Link href="/" className="mt-6 inline-block">
        <Button>Ir para o início</Button>
      </Link>
    </Container>
  );
}
