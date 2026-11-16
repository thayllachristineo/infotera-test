import { describe, expect, it } from "vitest";
import { quoteStay, resolveDiscount } from "@/lib/price";

describe("cotação", () => {
  it("soma diárias, taxa de 10% e impostos de 5%", () => {
    const quote = quoteStay({ pricePerNight: 1000, nights: 2, roomCount: 1 });
    expect(quote.base).toBe(2000);
    expect(quote.serviceFee).toBe(200);
    expect(quote.taxes).toBe(100);
    expect(quote.discount).toBe(0);
    expect(quote.total).toBe(2300);
  });

  it("multiplica pela quantidade de quartos", () => {
    const quote = quoteStay({ pricePerNight: 450, nights: 3, roomCount: 2 });
    expect(quote.base).toBe(2700);
    expect(quote.total).toBe(2700 + 270 + 135);
  });

  it("aplica ORLA10 e PRAIA50", () => {
    const percent = quoteStay({
      pricePerNight: 1000,
      nights: 2,
      roomCount: 1,
      discountCode: " orla10 ",
    });
    expect(percent.discount).toBe(200);
    expect(percent.total).toBe(2100);

    expect(resolveDiscount("PRAIA50", 399)).toMatchObject({ ok: false });
    const fixed = quoteStay({
      pricePerNight: 200,
      nights: 2,
      roomCount: 1,
      discountCode: "PRAIA50",
    });
    expect(fixed.base).toBe(400);
    expect(fixed.discount).toBe(50);
    expect(fixed.total).toBe(400 + 40 + 20 - 50);
  });

  it("ignora código desconhecido", () => {
    const quote = quoteStay({
      pricePerNight: 100,
      nights: 1,
      roomCount: 1,
      discountCode: "NADA",
    });
    expect(quote.discount).toBe(0);
    expect(quote.total).toBe(115);
  });
});
