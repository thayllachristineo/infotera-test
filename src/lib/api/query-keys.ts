import type { SearchCriteria, SearchFilters } from "@/types/search";

export const queryKeys = {
  suggestions: (term: string) => ["suggestions", term] as const,
  hotelList: (criteria: SearchCriteria, filters: SearchFilters) =>
    ["hotels", criteria, filters] as const,
  featured: ["hotels", "featured"] as const,
  similar: (destination: string) => ["hotels", "similar", destination] as const,
  hotel: (id: number) => ["hotel", id] as const,
  rooms: (hotelId: number) => ["rooms", hotelId] as const,
  reviews: (hotelId: number, page: number) =>
    ["reviews", hotelId, page] as const,
  booking: (id: string) => ["booking", id] as const,
};
