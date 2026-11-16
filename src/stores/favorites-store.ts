"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logError } from "@/lib/logger";
import type { FavoriteHotel } from "@/types/booking";

interface FavoritesState {
  hydrated: boolean;
  items: FavoriteHotel[];
  setHydrated: (value: boolean) => void;
  toggle: (hotel: FavoriteHotel) => boolean;
  remove: (id: number) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      items: [],
      setHydrated: (value) => set({ hydrated: value }),
      toggle: (hotel) => {
        const exists = get().items.some((item) => item.id === hotel.id);
        set({
          items: exists
            ? get().items.filter((item) => item.id !== hotel.id)
            : [hotel, ...get().items],
        });
        return !exists;
      },
      remove: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),
    }),
    {
      name: "orla:favorites",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state, error) => {
        if (error) logError("persist.favorites", error);
        state?.setHydrated(true);
      },
    },
  ),
);
