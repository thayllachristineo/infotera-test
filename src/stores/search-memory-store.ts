"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_RECENT_SEARCHES } from "@/lib/constants";
import { logError } from "@/lib/logger";
import type { SearchCriteria } from "@/types/search";

export interface RecentSearch extends SearchCriteria {
  id: string;
  searchedAt: string;
}

interface SearchMemoryState {
  hydrated: boolean;
  draft: SearchCriteria | null;
  recent: RecentSearch[];
  setHydrated: (value: boolean) => void;
  setDraft: (draft: SearchCriteria) => void;
  remember: (criteria: SearchCriteria) => void;
}

function sameSearch(left: SearchCriteria, right: SearchCriteria): boolean {
  return (
    left.destination === right.destination &&
    left.checkIn === right.checkIn &&
    left.checkOut === right.checkOut &&
    left.rooms === right.rooms &&
    left.adults === right.adults &&
    left.children === right.children
  );
}

export const useSearchMemoryStore = create<SearchMemoryState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      draft: null,
      recent: [],
      setHydrated: (value) => set({ hydrated: value }),
      setDraft: (draft) => set({ draft }),
      remember: (criteria) => {
        const entry: RecentSearch = {
          ...criteria,
          id: `${criteria.destination}-${criteria.checkIn}-${criteria.checkOut}-${criteria.adults}`,
          searchedAt: new Date().toISOString(),
        };
        set({
          draft: criteria,
          recent: [
            entry,
            ...get().recent.filter((item) => !sameSearch(item, criteria)),
          ].slice(0, MAX_RECENT_SEARCHES),
        });
      },
    }),
    {
      name: "orla:search",
      skipHydration: true,
      partialize: (state) => ({ draft: state.draft, recent: state.recent }),
      onRehydrateStorage: () => (state, error) => {
        if (error) logError("persist.search", error);
        state?.setHydrated(true);
      },
    },
  ),
);
