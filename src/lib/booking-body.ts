import type { Booking, GuestData } from "@/types/api";

/**
 * Corpo do POST /bookings.
 * A API recebe hóspedes, datas, ids, total e o snapshot da estadia.
 * Cartão, CVV e documento não entram, mesmo se vierem grudados no objeto.
 */
export function toBookingBody(
  payload: Omit<Booking, "id">,
): Omit<Booking, "id"> {
  return {
    hotelId: payload.hotelId,
    roomId: payload.roomId,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    rooms: payload.rooms,
    adults: payload.adults,
    children: payload.children,
    guests: payload.guests.map(toGuest),
    totalPrice: payload.totalPrice,
    createdAt: payload.createdAt,
    snapshot: payload.snapshot,
  };
}

function toGuest(guest: GuestData): GuestData {
  return {
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone,
  };
}
