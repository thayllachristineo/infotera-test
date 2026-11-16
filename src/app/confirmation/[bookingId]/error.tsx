"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function ConfirmationError({
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
      scope="route.confirmation"
      title="Não foi possível carregar a reserva"
    />
  );
}
