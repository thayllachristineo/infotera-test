"use server";

import { z } from "zod";
import { createBooking } from "@/lib/api/endpoints";
import { nightsBetween } from "@/lib/dates";
import { quoteStay } from "@/lib/price";
import type { Booking, BookingSnapshot, GuestData } from "@/types/api";

const guestSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().max(120),
  phone: z.string().trim().max(40),
});

const quoteSchema = z.object({
  nights: z.number(),
  roomCount: z.number(),
  pricePerNight: z.number(),
  base: z.number(),
  serviceFee: z.number(),
  taxes: z.number(),
  discount: z.number(),
  discountCode: z.string().nullable(),
  discountLabel: z.string().nullable(),
  total: z.number(),
});

const snapshotSchema = z.object({
  hotelName: z.string(),
  destination: z.string(),
  address: z.string(),
  thumbnail: z.string(),
  rating: z.number(),
  roomName: z.string(),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  cancellationPolicy: z.enum(["free", "moderate", "strict"]),
  pricePerNight: z.number().nonnegative(),
  quote: quoteSchema,
});

const bookingSchema = z.object({
  hotelId: z.number().int().positive(),
  roomId: z.number().int().positive(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rooms: z.number().int().min(1).max(4),
  adults: z.number().int().min(1).max(8),
  children: z.number().int().min(0).max(6),
  guests: z.array(guestSchema).min(1).max(8),
  totalPrice: z.number().nonnegative(),
  createdAt: z.string(),
  snapshot: snapshotSchema,
});

/**
 * Cria a reserva no servidor. O total é recalculado aqui.
 * Cartão, CVV e documento não fazem parte do schema e são descartados.
 */
export async function createBookingAction(
  input: Omit<Booking, "id">,
): Promise<Booking> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Não foi possível validar a reserva.");
  }

  const nights = nightsBetween(parsed.data.checkIn, parsed.data.checkOut);
  if (nights === null || nights < 1 || nights > 30) {
    throw new Error("Datas da reserva inválidas.");
  }

  const quote = quoteStay({
    pricePerNight: parsed.data.snapshot.pricePerNight,
    nights,
    roomCount: parsed.data.rooms,
    discountCode: parsed.data.snapshot.quote.discountCode,
  });
  const snapshot: BookingSnapshot = { ...parsed.data.snapshot, quote };
  const guests: GuestData[] = parsed.data.guests;

  return createBooking({
    hotelId: parsed.data.hotelId,
    roomId: parsed.data.roomId,
    checkIn: parsed.data.checkIn,
    checkOut: parsed.data.checkOut,
    rooms: parsed.data.rooms,
    adults: parsed.data.adults,
    children: parsed.data.children,
    guests,
    totalPrice: quote.total,
    createdAt: new Date().toISOString(),
    snapshot,
  });
}
