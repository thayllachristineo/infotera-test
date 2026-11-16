"use client";

import { cn } from "@/lib/cn";
import { useToastStore } from "@/stores/toast-store";

const TONE = {
  success: "border-pine/30 bg-foam",
  error: "border-clay/40 bg-[#fdece6]",
  info: "border-line bg-paper",
} as const;

export function ToastViewport() {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <section
      aria-label="Notificações"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
    >
      {items.map((item) => (
        <output
          key={item.id}
          className={cn(
            "pointer-events-auto block rounded-2xl border px-4 py-3 shadow-lg",
            TONE[item.tone],
          )}
        >
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-sm font-medium">{item.title}</span>
              {item.description ? (
                <span className="mt-1 block text-sm text-muted">
                  {item.description}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              className="text-sm text-muted"
              onClick={() => dismiss(item.id)}
            >
              Fechar
            </button>
          </span>
        </output>
      ))}
    </section>
  );
}
