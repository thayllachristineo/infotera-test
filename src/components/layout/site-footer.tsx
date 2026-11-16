import Link from "next/link";
import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <Container className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Orla · busca e reserva de hotéis para o teste de frontend.</p>
        <p>
          Pagamento simulado.{" "}
          <Link href="/" className="underline">
            Nova busca
          </Link>
        </p>
      </Container>
    </footer>
  );
}
