import { describe, expect, it } from "vitest";
import { addDays, todayISO } from "@/lib/dates";
import { checkoutSchema, searchSchema } from "@/lib/schemas";

describe("schemas Zod", () => {
  it("aceita uma busca dentro das regras de data", () => {
    const checkIn = addDays(todayISO(), 7);
    const result = searchSchema.safeParse({
      destination: "Gramado, RS",
      checkIn,
      checkOut: addDays(checkIn, 2),
      rooms: 1,
      adults: 2,
      children: 0,
    });
    expect(result.success).toBe(true);
  });

  it("recusa check-in no passado", () => {
    const result = searchSchema.safeParse({
      destination: "Gramado, RS",
      checkIn: "2020-01-10",
      checkOut: "2020-01-12",
      rooms: 1,
      adults: 2,
      children: 0,
    });
    expect(result.success).toBe(false);
  });

  it("exige CPF, telefone e cartão válidos no checkout", () => {
    const valid = checkoutSchema.safeParse({
      firstName: "Ana",
      lastName: "Lima",
      email: "ana@example.com",
      phoneCountry: "BR",
      phone: "(11) 98888-7777",
      documentType: "cpf",
      document: "529.982.247-25",
      companions: [{ firstName: "Leo", lastName: "Lima" }],
      cardName: "ANA LIMA",
      cardNumber: "4242 4242 4242 4242",
      expiry: "12/30",
      cvv: "123",
      terms: true,
      discountInput: "",
      appliedCode: "",
    });
    expect(valid.success).toBe(true);

    const invalid = checkoutSchema.safeParse({
      firstName: "Ana",
      lastName: "Lima",
      email: "ana",
      phoneCountry: "BR",
      phone: "123",
      documentType: "cpf",
      document: "111.111.111-11",
      companions: [],
      cardName: "AN",
      cardNumber: "4242 4242 4242 4241",
      expiry: "01/20",
      cvv: "12",
      terms: false,
      discountInput: "",
      appliedCode: "",
    });
    expect(invalid.success).toBe(false);
  });
});
