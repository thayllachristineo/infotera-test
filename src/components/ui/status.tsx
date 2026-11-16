import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-3xl border border-clay/30 bg-paper px-6 py-10 text-center"
    >
      <h2 className="font-display text-2xl">{title}</h2>
      {message ? <p className="mt-2 text-sm text-muted">{message}</p> : null}
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry}>
          Tentar de novo
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-paper px-6 py-12 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
