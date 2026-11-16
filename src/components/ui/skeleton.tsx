import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  const rounded = className?.includes("rounded") ? "" : "rounded-2xl";
  return <div className={cn("animate-pulse bg-line/80", rounded, className)} />;
}

export function PendingBar({ active }: { active: boolean }) {
  return (
    <div aria-hidden="true">
      <div
        className={cn(
          "h-0.5 w-full",
          active ? "animate-pulse bg-pine" : "bg-transparent",
        )}
      />
      <p className="sr-only" aria-live="polite">
        {active ? "Carregando" : ""}
      </p>
    </div>
  );
}
