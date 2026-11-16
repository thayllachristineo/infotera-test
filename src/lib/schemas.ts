import { z } from "zod";
import { stayDateIssues, todayISO } from "@/lib/dates";
import {
  isValidBrPhone,
  isValidCpf,
  isValidExpiry,
  isValidIntlPhone,
  isValidLuhn,
  isValidPassport,
} from "@/lib/documents";

export const searchSchema = z
  .object({
    destination: z.string().trim().min(1, "Selecione um destino da lista"),
    checkIn: z.string(),
    checkOut: z.string(),
    rooms: z.number().int().min(1).max(4),
    adults: z.number().int().min(1).max(8),
    children: z.number().int().min(0).max(6),
  })
  .superRefine((value, context) => {
    for (const issue of stayDateIssues(value, todayISO())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [issue.path],
        message: issue.message,
      });
    }
  });

export type SearchFormValues = z.infer<typeof searchSchema>;

const companionSchema = z.object({
  firstName: z.string().trim().min(2, "Informe o nome"),
  lastName: z.string().trim().min(2, "Informe o sobrenome"),
});

export const checkoutSchema = z
  .object({
    firstName: z.string().trim().min(2, "Informe o nome"),
    lastName: z.string().trim().min(2, "Informe o sobrenome"),
    email: z.string().trim().email("E-mail inválido"),
    phoneCountry: z.enum(["BR", "INTL"]),
    phone: z.string().trim(),
    documentType: z.enum(["cpf", "passport"]),
    document: z.string().trim(),
    companions: z.array(companionSchema),
    cardName: z.string().trim().min(3, "Informe o nome como está no cartão"),
    cardNumber: z.string().refine((value) => isValidLuhn(value), {
      message: "Número de cartão inválido",
    }),
    expiry: z.string().refine((value) => isValidExpiry(value), {
      message: "Validade expirada ou inválida",
    }),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
    terms: z.boolean().refine((value) => value, {
      message: "Aceite os termos para confirmar",
    }),
    discountInput: z.string(),
    appliedCode: z.string(),
  })
  .superRefine((value, context) => {
    const phoneOk =
      value.phoneCountry === "BR"
        ? isValidBrPhone(value.phone)
        : isValidIntlPhone(value.phone);
    if (!phoneOk) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message:
          value.phoneCountry === "BR"
            ? "Telefone brasileiro inválido"
            : "Telefone internacional inválido",
      });
    }

    const documentOk =
      value.documentType === "cpf"
        ? isValidCpf(value.document)
        : isValidPassport(value.document);
    if (!documentOk) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["document"],
        message:
          value.documentType === "cpf" ? "CPF inválido" : "Passaporte inválido",
      });
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const GUEST_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "document",
  "companions",
] as const;

export const PAYMENT_FIELDS = [
  "cardName",
  "cardNumber",
  "expiry",
  "cvv",
] as const;

export const EMPTY_CHECKOUT: CheckoutFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneCountry: "BR",
  phone: "",
  documentType: "cpf",
  document: "",
  companions: [],
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  terms: false,
  discountInput: "",
  appliedCode: "",
};
