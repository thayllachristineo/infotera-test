"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function SearchError({
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
      scope="route.search"
      title="A busca encontrou um erro"
    />
  );
}
