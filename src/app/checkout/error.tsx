"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function CheckoutError({
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
      scope="route.checkout"
      title="O checkout encontrou um erro"
    />
  );
}
