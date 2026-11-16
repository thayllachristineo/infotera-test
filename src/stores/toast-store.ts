"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastState {
  items: ToastItem[];
  push: (toast: Omit<ToastItem, "id" | "tone"> & { tone?: ToastTone }) => void;
  dismiss: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (toast) => {
    counter += 1;
    const id = `toast-${counter}`;
    set((state) => ({
      items: [
        ...state.items,
        {
          id,
          title: toast.title,
          description: toast.description,
          tone: toast.tone ?? "info",
        },
      ].slice(-3),
    }));
    window.setTimeout(() => {
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    }, 4200);
  },
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export function pushToast(
  toast: Omit<ToastItem, "id" | "tone"> & { tone?: ToastTone },
): void {
  useToastStore.getState().push(toast);
}
