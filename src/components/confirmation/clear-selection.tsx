"use client";

import { useEffect } from "react";
import { useBookingStore } from "@/stores/booking-store";

/** A reserva já existe: solta a seleção para o checkout não reabrir a mesma estadia. */
export function ClearSelection() {
  useEffect(() => {
    useBookingStore.getState().clearSelection();
  }, []);
  return null;
}
