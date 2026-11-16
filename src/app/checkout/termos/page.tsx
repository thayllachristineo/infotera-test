import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { TERMS_TEXT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Termos e condições",
};

export default function CheckoutTermsPage() {
  return (
    <Container className="py-10">
      <h1 className="font-display text-4xl">Termos e condições</h1>
      <div className="mt-6 max-w-2xl space-y-3 text-sm leading-6 whitespace-pre-wrap">
        {TERMS_TEXT}
      </div>
      <Link href="/checkout" className="mt-8 inline-block">
        <Button variant="secondary">Voltar ao checkout</Button>
      </Link>
    </Container>
  );
}
