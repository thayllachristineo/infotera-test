"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_BOOKING_HISTORY } from "@/lib/constants";
import { logError } from "@/lib/logger";
import type {
  BookingHistoryItem,
  CheckoutDraft,
  StaySelection,
} from "@/types/booking";

interface BookingState {
  hydrated: boolean;
  selection: StaySelection | null;
  checkoutDraft: { key: string; values: CheckoutDraft } | null;
  history: BookingHistoryItem[];
  setHydrated: (value: boolean) => void;
  select: (selection: StaySelection) => void;
  clearSelection: () => void;
  saveDraft: (key: string, values: CheckoutDraft) => void;
  clearDraft: () => void;
  rememberBooking: (item: BookingHistoryItem) => void;
}

export function selectionKey(selection: StaySelection): string {
  return [
    selection.hotel.id,
    selection.room.id,
    selection.checkIn,
    selection.checkOut,
    selection.roomCount,
    selection.adults,
    selection.children,
  ].join(":");
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      selection: null,
      checkoutDraft: null,
      history: [],
      setHydrated: (value) => set({ hydrated: value }),
      select: (selection) => {
        const nextKey = selectionKey(selection);
        const draft = get().checkoutDraft;
        set({
          selection,
          checkoutDraft: draft?.key === nextKey ? draft : null,
        });
      },
      clearSelection: () => set({ selection: null, checkoutDraft: null }),
      saveDraft: (key, values) => set({ checkoutDraft: { key, values } }),
      clearDraft: () => set({ checkoutDraft: null }),
      rememberBooking: (item) => {
        const history = [
          item,
          ...get().history.filter((entry) => entry.id !== item.id),
        ].slice(0, MAX_BOOKING_HISTORY);
        set({ history });
      },
    }),
    {
      name: "orla:booking",
      skipHydration: true,
      partialize: (state) => ({
        selection: state.selection,
        checkoutDraft: state.checkoutDraft,
        history: state.history,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) logError("persist.booking", error);
        state?.setHydrated(true);
      },
    },
  ),
);
