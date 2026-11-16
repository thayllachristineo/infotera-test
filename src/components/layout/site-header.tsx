"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { useFavoritesStore } from "@/stores/favorites-store";

export function SiteHeader() {
  const hydrated = useFavoritesStore((state) => state.hydrated);
  const count = useFavoritesStore((state) => state.items.length);
  const favorites = hydrated ? count : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-sand/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Orla
        </Link>
        <nav
          aria-label="Principal"
          className="flex items-center gap-1 text-sm sm:gap-2"
        >
          <Link href="/" className="rounded-full px-3 py-2 hover:bg-paper">
            Buscar
          </Link>
          <Link
            href="/favorites"
            className="rounded-full px-3 py-2 hover:bg-paper"
          >
            Favoritos
            <span className="ml-1 text-muted">({favorites})</span>
          </Link>
          <Link
            href="/reservas"
            className="rounded-full px-3 py-2 hover:bg-paper"
          >
            Reservas
          </Link>
        </nav>
      </Container>
    </header>
  );
}
