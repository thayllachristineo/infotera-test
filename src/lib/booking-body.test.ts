import { describe, expect, it } from "vitest";
import { toBookingBody } from "@/lib/booking-body";
import type { Booking } from "@/types/api";

const payload: Omit<Booking, "id"> = {
  hotelId: 1,
  roomId: 2,
  checkIn: "2026-12-01",
  checkOut: "2026-12-04",
  rooms: 1,
  adults: 2,
  children: 0,
  guests: [
    {
      firstName: "Ana",
      lastName: "Silva",
      email: "ana@example.com",
      phone: "(11) 98888-7777",
    },
  ],
  totalPrice: 1898,
  createdAt: "2026-11-16T12:00:00.000Z",
  snapshot: {
    hotelName: "Hotel Copacabana Palace",
    destination: "Rio de Janeiro, RJ",
    address: "Av. Atlântica",
    thumbnail: "https://images.unsplash.com/photo",
    rating: 4.8,
    roomName: "Suíte",
    checkInTime: "15:00",
    checkOutTime: "12:00",
    cancellationPolicy: "free",
    pricePerNight: 550,
    quote: {
      nights: 3,
      roomCount: 1,
      pricePerNight: 550,
      base: 1650,
      serviceFee: 165,
      taxes: 83,
      discount: 0,
      discountCode: null,
      discountLabel: null,
      total: 1898,
    },
  },
};

describe("corpo da reserva", () => {
  it("manda hóspedes, datas, ids, total e snapshot", () => {
    const body = toBookingBody(payload);
    expect(body.hotelId).toBe(1);
    expect(body.roomId).toBe(2);
    expect(body.checkIn).toBe("2026-12-01");
    expect(body.guests[0]?.firstName).toBe("Ana");
    expect(body.totalPrice).toBe(1898);
    expect(body.snapshot.quote.serviceFee).toBe(165);
    expect(body.snapshot.quote.taxes).toBe(83);
  });

  it("descarta documento, cartão e CVV", () => {
    const dirty = {
      ...payload,
      cardNumber: "4242 4242 4242 4242",
      cvv: "123",
      guests: [
        {
          ...payload.guests[0],
          cpf: "529.982.247-25",
          document: "529.982.247-25",
          documentType: "cpf",
        },
      ],
    } as unknown as Omit<Booking, "id">;

    const serialized = JSON.stringify(toBookingBody(dirty));
    expect(serialized).not.toContain("529.982.247-25");
    expect(serialized).not.toContain("4242");
    expect(serialized).not.toContain("cpf");
    expect(serialized).not.toContain("cvv");
  });
});
