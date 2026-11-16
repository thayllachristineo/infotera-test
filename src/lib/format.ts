import { parseISODate } from "@/lib/dates";
import type { Bed } from "@/types/api";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const longDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatBRL(value: number): string {
  return currency.format(value);
}

export function formatDateBR(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return longDate.format(date);
}

export function nightsLabel(nights: number): string {
  return nights === 1 ? "1 noite" : `${nights} noites`;
}

export function guestsLabel(adults: number, children: number): string {
  const adultText = adults === 1 ? "1 adulto" : `${adults} adultos`;
  if (children <= 0) return adultText;
  const childText = children === 1 ? "1 criança" : `${children} crianças`;
  return `${adultText} e ${childText}`;
}

export function roomsLabel(rooms: number): string {
  return rooms === 1 ? "1 quarto" : `${rooms} quartos`;
}

const BED_LABEL: Record<Bed["type"], string> = {
  single: "solteiro",
  double: "casal",
  queen: "queen",
  king: "king",
  twin: "twin",
  sofa_bed: "sofá-cama",
};

export function formatBeds(beds: Bed[]): string {
  if (beds.length === 0) return "Camas a confirmar";
  return beds
    .map((bed) => `${bed.quantity}× ${BED_LABEL[bed.type]}`)
    .join(", ");
}
