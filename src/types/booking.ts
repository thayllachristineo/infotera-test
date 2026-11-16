import type { Amenity, Bed, CancellationPolicy, PriceQuote } from "@/types/api";

/** Recorte do hotel/quarto guardado no Zustand. Evita persistir a galeria inteira. */
export interface StaySelection {
  hotel: {
    id: number;
    name: string;
    destination: string;
    address: string;
    thumbnail: string;
    rating: number;
    reviewCount: number;
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: CancellationPolicy;
    amenities: Amenity[];
  };
  room: {
    id: number;
    name: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    size: number;
    available: number;
    image: string | null;
    beds: Bed[];
  };
  roomCount: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

/** Rascunho do checkout. Cartão, CVV e documento ficam só em memória. */
export interface CheckoutDraft {
  step: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: "BR" | "INTL";
  phone: string;
  documentType: "cpf" | "passport";
  companions: Array<{ firstName: string; lastName: string }>;
  discountInput: string;
  appliedCode: string;
  terms: boolean;
}

export interface BookingHistoryItem {
  id: string;
  hotelName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  createdAt: string;
}

export interface FavoriteHotel {
  id: number;
  name: string;
  destination: string;
  thumbnail: string;
  pricePerNight: number;
  rating: number;
  propertyType: "hotel" | "pousada" | "resort";
}

export type { PriceQuote };
