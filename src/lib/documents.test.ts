import { describe, expect, it } from "vitest";
import {
  isValidBrPhone,
  isValidCpf,
  isValidExpiry,
  isValidLuhn,
  isValidPassport,
  maskCard,
  maskCpf,
  maskExpiry,
  maskPhone,
} from "@/lib/documents";

describe("documentos e pagamento", () => {
  it("valida CPF e rejeita sequência repetida", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("529.982.247-24")).toBe(false);
  });

  it("valida cartão com Luhn", () => {
    expect(isValidLuhn("4242 4242 4242 4242")).toBe(true);
    expect(isValidLuhn("4242 4242 4242 4241")).toBe(false);
    expect(isValidLuhn("1234")).toBe(false);
  });

  it("recusa validade vencida e aceita o mês corrente", () => {
    const now = new Date(2026, 10, 16);
    expect(isValidExpiry("11/26", now)).toBe(true);
    expect(isValidExpiry("10/26", now)).toBe(false);
    expect(isValidExpiry("13/26", now)).toBe(false);
    expect(isValidExpiry("1126", now)).toBe(false);
  });

  it("valida telefone brasileiro e passaporte", () => {
    expect(isValidBrPhone("(11) 98888-7777")).toBe(true);
    expect(isValidBrPhone("(11) 3333-4444")).toBe(true);
    expect(isValidBrPhone("(11) 18888-7777")).toBe(false);
    expect(isValidBrPhone("(01) 98888-7777")).toBe(false);
    expect(isValidPassport("AB123456")).toBe(true);
    expect(isValidPassport("12")).toBe(false);
  });

  it("aplica máscaras sem passar do tamanho", () => {
    expect(maskPhone("11988887777")).toBe("(11) 98888-7777");
    expect(maskCpf("52998224725")).toBe("529.982.247-25");
    expect(maskCard("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(maskExpiry("1226")).toBe("12/26");
  });
});
