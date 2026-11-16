export interface Suggestion {
  id: number;
  name: string;
  type: "city" | "beach" | "island" | "nature";
  country: string;
  searchName: string;
}

export type PropertyType = "hotel" | "pousada" | "resort";

export type CancellationPolicy = "free" | "moderate" | "strict";

export type Amenity =
  | "wifi"
  | "breakfast"
  | "pool"
  | "spa"
  | "restaurant"
  | "gym"
  | "parking"
  | "bar"
  | "room_service"
  | "beach_access"
  | "kids_club"
  | "business_center"
  | "concierge"
  | "valet"
  | "lounge_access";

export type RoomAmenity =
  | "ocean_view"
  | "city_view"
  | "garden_view"
  | "balcony"
  | "terrace"
  | "bathtub"
  | "minibar"
  | "safe"
  | "aircon"
  | "desk"
  | "kitchen"
  | "living_room"
  | "sound_system"
  | "butler"
  | "pool_access"
  | "garden"
  | "lounge_access";

export interface Hotel {
  id: number;
  name: string;
  slug: string;
  destination: string;
  description: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: "BRL";
  propertyType: PropertyType;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  thumbnail: string;
  amenities: Amenity[];
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: CancellationPolicy;
  availableRooms: number;
  featured: boolean;
}

export interface Bed {
  type: "single" | "double" | "queen" | "king" | "twin" | "sofa_bed";
  quantity: number;
}

export interface Room {
  id: number;
  hotelId: number;
  name: string;
  description: string;
  size: number;
  maxGuests: number;
  beds: Bed[];
  pricePerNight: number;
  amenities: RoomAmenity[];
  images: string[];
  available: number;
}

export interface Review {
  id: number;
  hotelId: number;
  guestName: string;
  guestAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

/** Hóspede enviado à API. Documento, cartão e CVV ficam só no navegador. */
export interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Cotação calculada no cliente. A API não devolve taxas nem desconto. */
export interface PriceQuote {
  nights: number;
  roomCount: number;
  pricePerNight: number;
  base: number;
  serviceFee: number;
  taxes: number;
  discount: number;
  discountCode: string | null;
  discountLabel: string | null;
  total: number;
}

/**
 * Foto e nomes gravados junto da reserva.
 * O json-server não expande hotel/quarto no GET, então a confirmação
 * sobrevive a um reload sem uma segunda busca.
 */
export interface BookingSnapshot {
  hotelName: string;
  destination: string;
  address: string;
  thumbnail: string;
  rating: number;
  roomName: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: CancellationPolicy;
  pricePerNight: number;
  quote: PriceQuote;
}

export interface Booking {
  id: number | string;
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  guests: GuestData[];
  totalPrice: number;
  createdAt: string;
  snapshot: BookingSnapshot;
}

export interface HotelListResult {
  hotels: Hotel[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewPage {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}
