import {
  isAmenity,
  isPropertyType,
  PAGE_SIZE,
  PRICE_MAX,
  PRICE_MIN,
} from "@/lib/constants";
import { stayDateIssues } from "@/lib/dates";
import type { SearchCriteria, SearchFilters, SortKey } from "@/types/search";
import { SORT_KEYS } from "@/types/search";

export const EMPTY_CRITERIA: SearchCriteria = {
  destination: "",
  checkIn: "",
  checkOut: "",
  rooms: 1,
  adults: 2,
  children: 0,
};

export const EMPTY_FILTERS: SearchFilters = {
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  minRating: 0,
  propertyTypes: [],
  amenities: [],
  sort: "popular",
  page: 1,
};

function readInt(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = params.get(key);
  if (raw === null || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function readSort(value: string | null): SortKey {
  if (value && (SORT_KEYS as readonly string[]).includes(value)) {
    return value as SortKey;
  }
  return "popular";
}

function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseSearchState(
  params: URLSearchParams,
  today: string,
): {
  criteria: SearchCriteria;
  filters: SearchFilters;
  dateIssues: ReturnType<typeof stayDateIssues>;
} {
  const minPrice = readInt(params, "minPrice", PRICE_MIN, PRICE_MIN, PRICE_MAX);
  let maxPrice = readInt(params, "maxPrice", PRICE_MAX, PRICE_MIN, PRICE_MAX);
  if (maxPrice < minPrice) maxPrice = minPrice;

  const criteria: SearchCriteria = {
    destination: params.get("destination")?.trim() ?? "",
    checkIn: params.get("checkIn") ?? "",
    checkOut: params.get("checkOut") ?? "",
    rooms: readInt(params, "rooms", 1, 1, 4),
    adults: readInt(params, "adults", 2, 1, 8),
    children: readInt(params, "children", 0, 0, 6),
  };

  const filters: SearchFilters = {
    minPrice,
    maxPrice,
    minRating: readInt(params, "rating", 0, 0, 5),
    propertyTypes: readList(params, "propertyType").filter(isPropertyType),
    amenities: readList(params, "amenities").filter(isAmenity),
    sort: readSort(params.get("sort")),
    page: readInt(params, "page", 1, 1, 99),
  };

  return {
    criteria,
    filters,
    dateIssues: stayDateIssues(criteria, today),
  };
}

export function isSearchReady(
  criteria: SearchCriteria,
  dateIssues: ReturnType<typeof stayDateIssues>,
): boolean {
  return criteria.destination.length > 0 && dateIssues.length === 0;
}

export function buildSearchHref(
  criteria: SearchCriteria,
  filters: SearchFilters = EMPTY_FILTERS,
): string {
  const params = new URLSearchParams();
  params.set("destination", criteria.destination);
  params.set("checkIn", criteria.checkIn);
  params.set("checkOut", criteria.checkOut);
  params.set("rooms", String(criteria.rooms));
  params.set("adults", String(criteria.adults));
  params.set("children", String(criteria.children));
  if (filters.minPrice > PRICE_MIN)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice < PRICE_MAX)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating > 0) params.set("rating", String(filters.minRating));
  if (filters.propertyTypes.length > 0) {
    params.set("propertyType", filters.propertyTypes.join(","));
  }
  if (filters.amenities.length > 0) {
    params.set("amenities", filters.amenities.join(","));
  }
  if (filters.sort !== "popular") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return `/search?${params.toString()}`;
}

export function buildHotelHref(
  hotelId: number,
  criteria: SearchCriteria,
): string {
  const params = new URLSearchParams();
  if (criteria.destination) params.set("destination", criteria.destination);
  if (criteria.checkIn) params.set("checkIn", criteria.checkIn);
  if (criteria.checkOut) params.set("checkOut", criteria.checkOut);
  params.set("rooms", String(criteria.rooms));
  params.set("adults", String(criteria.adults));
  params.set("children", String(criteria.children));
  return `/hotel/${hotelId}?${params.toString()}`;
}

export function filtersAreActive(filters: SearchFilters): boolean {
  return (
    filters.minPrice > PRICE_MIN ||
    filters.maxPrice < PRICE_MAX ||
    filters.minRating > 0 ||
    filters.propertyTypes.length > 0 ||
    filters.amenities.length > 0
  );
}

export { PAGE_SIZE };
