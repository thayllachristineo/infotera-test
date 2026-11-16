import type { Amenity, PropertyType } from "@/types/api";

/** Critérios que a home envia para `/search` e que a reserva reutiliza. */
export interface SearchCriteria {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

export const SORT_KEYS = ["popular", "price_asc", "rating_desc"] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export interface SearchFilters {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  propertyTypes: PropertyType[];
  amenities: Amenity[];
  sort: SortKey;
  page: number;
}

export interface StayDateIssue {
  path: "checkIn" | "checkOut";
  message: string;
}
