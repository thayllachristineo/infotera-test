import type { PriceQuote } from "@/types/api";

/** Taxa de serviço e impostos são premissa do front: a API só manda a diária. */
export const SERVICE_FEE_RATE = 0.1;
export const TAX_RATE = 0.05;

export type DiscountResolution =
  | { ok: true; code: string; amount: number; label: string }
  | { ok: false; reason: string };

/**
 * Códigos locais. A mock-api não tem endpoint de cupom.
 * ORLA10: 10% sobre as diárias. PRAIA50: R$ 50 se as diárias somam ao menos R$ 400.
 */
export function resolveDiscount(
  code: string,
  base: number,
): DiscountResolution | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  if (normalized === "ORLA10") {
    return {
      ok: true,
      code: "ORLA10",
      amount: Math.round(base * 0.1),
      label: "ORLA10 · 10% nas diárias",
    };
  }

  if (normalized === "PRAIA50") {
    if (base < 400) {
      return {
        ok: false,
        reason: "PRAIA50 vale para diárias a partir de R$ 400",
      };
    }
    return {
      ok: true,
      code: "PRAIA50",
      amount: 50,
      label: "PRAIA50 · R$ 50 nas diárias",
    };
  }

  return { ok: false, reason: "Código inválido" };
}

export function quoteStay(input: {
  pricePerNight: number;
  nights: number;
  roomCount: number;
  discountCode?: string | null;
}): PriceQuote {
  const nights = Math.max(0, input.nights);
  const roomCount = Math.max(0, input.roomCount);
  const base = Math.round(input.pricePerNight * nights * roomCount);
  const discount = resolveDiscount(input.discountCode ?? "", base);
  const applied = discount?.ok ? discount : null;
  const serviceFee = Math.round(base * SERVICE_FEE_RATE);
  const taxes = Math.round(base * TAX_RATE);
  const discountAmount = applied?.amount ?? 0;

  return {
    nights,
    roomCount,
    pricePerNight: input.pricePerNight,
    base,
    serviceFee,
    taxes,
    discount: discountAmount,
    discountCode: applied?.code ?? null,
    discountLabel: applied?.label ?? null,
    total: Math.max(0, base + serviceFee + taxes - discountAmount),
  };
}
