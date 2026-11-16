"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { getQueryClient } from "@/lib/query-client";
import { useBookingStore } from "@/stores/booking-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useSearchMemoryStore } from "@/stores/search-memory-store";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  useEffect(() => {
    void Promise.all([
      useBookingStore.persist.rehydrate(),
      useFavoritesStore.persist.rehydrate(),
      useSearchMemoryStore.persist.rehydrate(),
    ]).finally(() => {
      useBookingStore.getState().setHydrated(true);
      useFavoritesStore.getState().setHydrated(true);
      useSearchMemoryStore.getState().setHydrated(true);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastViewport />
    </QueryClientProvider>
  );
}
