"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function GlobalError({
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
      scope="route.global"
      title="Algo saiu do esperado"
    />
  );
}
