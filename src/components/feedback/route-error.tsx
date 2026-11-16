"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/ui/status";
import { logError } from "@/lib/logger";

export function RouteError({
  error,
  reset,
  scope,
  title,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  scope: string;
  title: string;
}) {
  useEffect(() => {
    logError(scope, error, { digest: error.digest ?? null });
  }, [error, scope]);

  return (
    <Container className="py-16">
      <ErrorState title={title} message={error.message} onRetry={reset} />
    </Container>
  );
}
