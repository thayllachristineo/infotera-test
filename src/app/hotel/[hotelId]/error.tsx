"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function HotelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      scope="route.hotel"
      title="Não foi possível abrir o hotel"
    />
  );
}
