import { describe, expect, it } from "vitest";
import { matchesDestination } from "@/lib/text";

const saoPaulo = { name: "São Paulo, SP", searchName: "sao paulo, sp" };
const bonito = { name: "Bonito, MS", searchName: "bonito, ms" };

describe("busca de destino", () => {
  it("ignora acento e caixa", () => {
    expect(matchesDestination(saoPaulo, "sao paulo")).toBe(true);
    expect(matchesDestination(saoPaulo, "SAO")).toBe(true);
    expect(matchesDestination(bonito, "sao paulo")).toBe(false);
  });

  it("não filtra com menos de duas letras", () => {
    expect(matchesDestination(bonito, "s")).toBe(true);
    expect(matchesDestination(bonito, "")).toBe(true);
  });
});
