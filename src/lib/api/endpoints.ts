import { ApiError, apiGet, apiPost } from "@/lib/api/client";
import { toBookingBody } from "@/lib/booking-body";
import {
  PAGE_SIZE,
  PRICE_MAX,
  REVIEW_PAGE_SIZE,
  SORT_OPTIONS,
} from "@/lib/constants";
import type {
  Booking,
  BookingSnapshot,
  GuestData,
  Hotel,
  HotelListResult,
  PriceQuote,
  Review,
  ReviewPage,
  Room,
  Suggestion,
} from "@/types/api";
import type { SearchCriteria, SearchFilters } from "@/types/search";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asArray<T>(value: unknown): T[] {
  if (!Array.isArray(value)) {
    throw new ApiError("Resposta inesperada da API", 500);
  }
  return value as T[];
}

export async function getSuggestions(term: string): Promise<Suggestion[]> {
  const params = new URLSearchParams();
  const trimmed = term.trim();
  if (trimmed.length > 0) params.set("q", trimmed);
  const query = params.toString();
  const { data } = await apiGet(`/suggestions${query ? `?${query}` : ""}`);
  return asArray<Suggestion>(data);
}

export function toHotelQuery(
  criteria: Pick<SearchCriteria, "destination">,
  filters: SearchFilters,
): string {
  const params = new URLSearchParams();
  if (criteria.destination) params.set("destination", criteria.destination);
  if (filters.minPrice > 0) {
    params.set("pricePerNight_gte", String(filters.minPrice));
  }
  if (filters.maxPrice < PRICE_MAX) {
    params.set("pricePerNight_lte", String(filters.maxPrice));
  }
  if (filters.minRating > 0)
    params.set("rating_gte", String(filters.minRating));
  for (const propertyType of filters.propertyTypes) {
    params.append("propertyType", propertyType);
  }
  for (const amenity of filters.amenities) {
    params.append("amenities_like", amenity);
  }
  const sort =
    SORT_OPTIONS.find((option) => option.id === filters.sort) ??
    SORT_OPTIONS[0];
  params.set("_sort", sort.field);
  params.set("_order", sort.order);
  params.set("_page", String(filters.page));
  params.set("_limit", String(PAGE_SIZE));
  return params.toString();
}

export async function listHotels(
  criteria: Pick<SearchCriteria, "destination">,
  filters: SearchFilters,
): Promise<HotelListResult> {
  const { data, total } = await apiGet(
    `/hotels?${toHotelQuery(criteria, filters)}`,
  );
  const hotels = asArray<Hotel>(data);
  return {
    hotels,
    total: total ?? hotels.length,
    page: filters.page,
    limit: PAGE_SIZE,
  };
}

export async function listFeatured(): Promise<Hotel[]> {
  const { data } = await apiGet(
    "/hotels?featured=true&_sort=rating&_order=desc&_limit=4",
  );
  return asArray<Hotel>(data);
}

export async function listSimilar(destination: string): Promise<Hotel[]> {
  const params = new URLSearchParams({
    destination,
    _sort: "rating",
    _order: "desc",
    _limit: "8",
  });
  const { data } = await apiGet(`/hotels?${params.toString()}`);
  return asArray<Hotel>(data);
}

export async function getHotel(id: number): Promise<Hotel> {
  const { data } = await apiGet(`/hotels/${id}`);
  if (!isRecord(data) || typeof data.id !== "number") {
    throw new ApiError("Hotel não encontrado", 404);
  }
  return data as unknown as Hotel;
}

export async function getRooms(hotelId: number): Promise<Room[]> {
  const params = new URLSearchParams({
    hotelId: String(hotelId),
    _sort: "pricePerNight",
    _order: "asc",
  });
  const { data } = await apiGet(`/rooms?${params.toString()}`);
  return asArray<Room>(data);
}

export async function getReviews(
  hotelId: number,
  page: number,
): Promise<ReviewPage> {
  const params = new URLSearchParams({
    hotelId: String(hotelId),
    _sort: "date",
    _order: "desc",
    _page: String(page),
    _limit: String(REVIEW_PAGE_SIZE),
  });
  const { data, total } = await apiGet(`/reviews?${params.toString()}`);
  const reviews = asArray<Review>(data);
  return {
    reviews,
    total: total ?? reviews.length,
    page,
    limit: REVIEW_PAGE_SIZE,
  };
}

function parseQuote(value: unknown): PriceQuote {
  const quote = isRecord(value) ? value : {};
  return {
    nights: readNumber(quote.nights),
    roomCount: readNumber(quote.roomCount),
    pricePerNight: readNumber(quote.pricePerNight),
    base: readNumber(quote.base),
    serviceFee: readNumber(quote.serviceFee),
    taxes: readNumber(quote.taxes),
    discount: readNumber(quote.discount),
    discountCode:
      typeof quote.discountCode === "string" ? quote.discountCode : null,
    discountLabel:
      typeof quote.discountLabel === "string" ? quote.discountLabel : null,
    total: readNumber(quote.total),
  };
}

function parseSnapshot(value: unknown): BookingSnapshot {
  const snapshot = isRecord(value) ? value : {};
  const policy = snapshot.cancellationPolicy;
  return {
    hotelName: readString(snapshot.hotelName),
    destination: readString(snapshot.destination),
    address: readString(snapshot.address),
    thumbnail: readString(snapshot.thumbnail),
    rating: readNumber(snapshot.rating),
    roomName: readString(snapshot.roomName),
    checkInTime: readString(snapshot.checkInTime),
    checkOutTime: readString(snapshot.checkOutTime),
    cancellationPolicy:
      policy === "free" || policy === "moderate" || policy === "strict"
        ? policy
        : "moderate",
    pricePerNight: readNumber(snapshot.pricePerNight),
    quote: parseQuote(snapshot.quote),
  };
}

function parseGuest(value: unknown): GuestData {
  const guest = isRecord(value) ? value : {};
  return {
    firstName: readString(guest.firstName),
    lastName: readString(guest.lastName),
    email: readString(guest.email),
    phone: readString(guest.phone),
  };
}

export function parseBooking(value: unknown): Booking {
  if (!isRecord(value)) {
    throw new ApiError("Resposta de reserva inválida", 500);
  }
  if (typeof value.id !== "number" && typeof value.id !== "string") {
    throw new ApiError("Resposta de reserva inválida", 500);
  }
  return {
    id: value.id,
    hotelId: readNumber(value.hotelId),
    roomId: readNumber(value.roomId),
    checkIn: readString(value.checkIn),
    checkOut: readString(value.checkOut),
    rooms: readNumber(value.rooms, 1),
    adults: readNumber(value.adults, 1),
    children: readNumber(value.children),
    guests: Array.isArray(value.guests) ? value.guests.map(parseGuest) : [],
    totalPrice: readNumber(value.totalPrice),
    createdAt: readString(value.createdAt),
    snapshot: parseSnapshot(value.snapshot),
  };
}

export async function createBooking(
  payload: Omit<Booking, "id">,
): Promise<Booking> {
  const data = await apiPost("/bookings", toBookingBody(payload));
  return parseBooking(data);
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await apiGet(`/bookings/${encodeURIComponent(id)}`);
  return parseBooking(data);
}
