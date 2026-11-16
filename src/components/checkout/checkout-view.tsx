"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type FieldErrors, useForm, useWatch } from "react-hook-form";
import { createBookingAction } from "@/app/checkout/actions";
import { PriceSummary } from "@/components/checkout/price-summary";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { nightsBetween } from "@/lib/dates";
import { maskCard, maskCpf, maskExpiry, maskPhone } from "@/lib/documents";
import { formatDateBR, guestsLabel, roomsLabel } from "@/lib/format";
import { quoteStay, resolveDiscount } from "@/lib/price";
import {
  type CheckoutFormValues,
  checkoutSchema,
  EMPTY_CHECKOUT,
  GUEST_FIELDS,
  PAYMENT_FIELDS,
} from "@/lib/schemas";
import { selectionKey, useBookingStore } from "@/stores/booking-store";
import type { Booking, GuestData } from "@/types/api";
import type { CheckoutDraft } from "@/types/booking";

const STEPS = ["Dados", "Pagamento", "Revisão"] as const;

function messageOf(
  errors: FieldErrors<CheckoutFormValues>,
  name: keyof CheckoutFormValues,
): string | undefined {
  const error = errors[name];
  if (!error || Array.isArray(error) || !("message" in error)) return undefined;
  return typeof error.message === "string" ? error.message : undefined;
}

function draftFrom(values: CheckoutFormValues, step: number): CheckoutDraft {
  return {
    step,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phoneCountry: values.phoneCountry,
    phone: values.phone,
    documentType: values.documentType,
    companions: values.companions,
    discountInput: values.discountInput,
    appliedCode: values.appliedCode,
    terms: values.terms,
  };
}

/**
 * Checkout em três passos. Cartão e documento são validados aqui e não
 * entram no POST nem no localStorage.
 */
export function CheckoutView() {
  const router = useRouter();
  const hydrated = useBookingStore((state) => state.hydrated);
  const selection = useBookingStore((state) => state.selection);
  const [step, setStep] = useState(0);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const booted = useRef(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: EMPTY_CHECKOUT,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (hydrated && !selection && !submittedId) router.replace("/");
  }, [hydrated, selection, submittedId, router]);

  useEffect(() => {
    if (!hydrated || !selection || booted.current) return;
    booted.current = true;
    const key = selectionKey(selection);
    const draft = useBookingStore.getState().checkoutDraft;
    const companions = Array.from(
      { length: Math.max(0, selection.adults - 1) },
      (_, index) =>
        draft?.key === key
          ? (draft.values.companions[index] ?? { firstName: "", lastName: "" })
          : { firstName: "", lastName: "" },
    );
    if (draft?.key === key) {
      form.reset({
        ...EMPTY_CHECKOUT,
        ...draft.values,
        document: "",
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
        companions,
      });
      setStep(Math.min(draft.values.step, 2));
      return;
    }
    form.setValue("companions", companions);
  }, [hydrated, selection, form]);

  const watched = useWatch({ control: form.control });

  useEffect(() => {
    if (!selection || !booted.current) return;
    const firstName = watched.firstName ?? "";
    const timeout = window.setTimeout(() => {
      const values = form.getValues();
      useBookingStore
        .getState()
        .saveDraft(selectionKey(selection), draftFrom(values, step));
      void firstName;
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [watched, step, selection, form]);

  const mutation = useMutation({
    mutationKey: ["create-booking"],
    mutationFn: (payload: Omit<Booking, "id">) => createBookingAction(payload),
    onSuccess: (booking) => {
      useBookingStore.getState().rememberBooking({
        id: String(booking.id),
        hotelName: booking.snapshot.hotelName,
        destination: booking.snapshot.destination,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt,
      });
      setSubmittedId(String(booking.id));
      router.push(`/confirmation/${booking.id}`);
    },
  });

  if (!hydrated || !selection) {
    return (
      <Container className="py-10">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-80 w-full" />
      </Container>
    );
  }

  const nights = nightsBetween(selection.checkIn, selection.checkOut) ?? 0;
  const appliedCode = form.watch("appliedCode");
  const quote = quoteStay({
    pricePerNight: selection.room.pricePerNight,
    nights,
    roomCount: selection.roomCount,
    discountCode: appliedCode,
  });
  const errors = form.formState.errors;

  async function goNext() {
    const fields = step === 0 ? [...GUEST_FIELDS] : [...PAYMENT_FIELDS];
    const valid = await form.trigger(fields);
    if (valid) setStep((current) => Math.min(current + 1, 2));
  }

  function applyDiscount() {
    const result = resolveDiscount(form.getValues("discountInput"), quote.base);
    if (!result) {
      form.setValue("appliedCode", "");
      setDiscountMessage(null);
      return;
    }
    if (!result.ok) {
      form.setValue("appliedCode", "");
      setDiscountMessage(result.reason);
      return;
    }
    form.setValue("appliedCode", result.code);
    setDiscountMessage(`${result.label} aplicado`);
  }

  function jumpToError(formErrors: FieldErrors<CheckoutFormValues>) {
    if (
      formErrors.firstName ||
      formErrors.lastName ||
      formErrors.email ||
      formErrors.phone ||
      formErrors.document ||
      formErrors.companions
    ) {
      setStep(0);
      return;
    }
    if (
      formErrors.cardName ||
      formErrors.cardNumber ||
      formErrors.expiry ||
      formErrors.cvv
    ) {
      setStep(1);
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    const guests: GuestData[] = [
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
      },
      ...values.companions.map((companion) => ({
        firstName: companion.firstName,
        lastName: companion.lastName,
        email: "",
        phone: "",
      })),
    ];
    mutation.mutate({
      hotelId: selection.hotel.id,
      roomId: selection.room.id,
      checkIn: selection.checkIn,
      checkOut: selection.checkOut,
      rooms: selection.roomCount,
      adults: selection.adults,
      children: selection.children,
      guests,
      totalPrice: quote.total,
      createdAt: new Date().toISOString(),
      snapshot: {
        hotelName: selection.hotel.name,
        destination: selection.hotel.destination,
        address: selection.hotel.address,
        thumbnail: selection.hotel.thumbnail,
        rating: selection.hotel.rating,
        roomName: selection.room.name,
        checkInTime: selection.hotel.checkInTime,
        checkOutTime: selection.hotel.checkOutTime,
        cancellationPolicy: selection.hotel.cancellationPolicy,
        pricePerNight: selection.room.pricePerNight,
        quote,
      },
    });
  }, jumpToError);

  const phoneCountry = form.watch("phoneCountry");
  const documentType = form.watch("documentType");

  return (
    <Container className="py-8">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        {selection.hotel.name} · {selection.room.name} ·{" "}
        {roomsLabel(selection.roomCount)}
      </p>
      <ol className="mt-6 flex gap-2" aria-label="Etapas">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm ${
                index === step
                  ? "bg-pine text-paper"
                  : "bg-paper ring-1 ring-line"
              }`}
              aria-current={index === step ? "step" : undefined}
              disabled={index > step}
              onClick={() => {
                if (index < step) setStep(index);
              }}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form
          className="rounded-3xl border border-line bg-paper p-5"
          onSubmit={onSubmit}
          noValidate
        >
          {step === 0 ? (
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 font-display text-2xl sm:col-span-2">
                Quem se hospeda
              </legend>
              <TextField
                id="firstName"
                label="Nome"
                autoComplete="given-name"
                error={messageOf(errors, "firstName")}
                {...form.register("firstName")}
              />
              <TextField
                id="lastName"
                label="Sobrenome"
                autoComplete="family-name"
                error={messageOf(errors, "lastName")}
                {...form.register("lastName")}
              />
              <TextField
                id="email"
                label="E-mail"
                type="email"
                autoComplete="email"
                wrapperClassName="sm:col-span-2"
                error={messageOf(errors, "email")}
                {...form.register("email")}
              />
              <SelectField
                id="phoneCountry"
                label="País do telefone"
                value={phoneCountry}
                onChange={(event) => {
                  const country = event.target.value === "INTL" ? "INTL" : "BR";
                  form.setValue("phoneCountry", country, {
                    shouldValidate: true,
                  });
                  form.setValue(
                    "documentType",
                    country === "BR" ? "cpf" : "passport",
                  );
                }}
              >
                <option value="BR">Brasil</option>
                <option value="INTL">Outro país</option>
              </SelectField>
              <TextField
                id="phone"
                label="Telefone"
                inputMode="tel"
                autoComplete="tel"
                placeholder={
                  phoneCountry === "BR" ? "(11) 98888-7777" : "+1 202 555 0147"
                }
                error={messageOf(errors, "phone")}
                {...form.register("phone", {
                  onChange: (event) => {
                    const value = event.target.value as string;
                    form.setValue(
                      "phone",
                      phoneCountry === "BR"
                        ? maskPhone(value)
                        : value.replace(/[^\d+\s()-]/g, "").slice(0, 20),
                    );
                  },
                })}
              />
              <SelectField
                id="documentType"
                label="Documento"
                value={documentType}
                onChange={(event) =>
                  form.setValue(
                    "documentType",
                    event.target.value === "passport" ? "passport" : "cpf",
                    { shouldValidate: true },
                  )
                }
              >
                <option value="cpf">CPF</option>
                <option value="passport">Passaporte</option>
              </SelectField>
              <TextField
                id="document"
                label={documentType === "cpf" ? "CPF" : "Passaporte"}
                autoComplete="off"
                error={messageOf(errors, "document")}
                {...form.register("document", {
                  onChange: (event) => {
                    const value = event.target.value as string;
                    form.setValue(
                      "document",
                      documentType === "cpf"
                        ? maskCpf(value)
                        : value
                            .replace(/[^A-Za-z0-9]/g, "")
                            .slice(0, 15)
                            .toUpperCase(),
                    );
                  },
                })}
              />
              {form.watch("companions").map((companion, index) => (
                <div
                  key={`companion-slot-${String(index)}`}
                  className="grid gap-4 sm:col-span-2 sm:grid-cols-2"
                >
                  <p className="text-sm font-medium sm:col-span-2">
                    Acompanhante {index + 1}
                  </p>
                  <TextField
                    id={`companion-${index}-first`}
                    label="Nome"
                    value={companion.firstName}
                    error={errors.companions?.[index]?.firstName?.message}
                    onChange={(event) =>
                      form.setValue(
                        `companions.${index}.firstName`,
                        event.target.value,
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  />
                  <TextField
                    id={`companion-${index}-last`}
                    label="Sobrenome"
                    value={companion.lastName}
                    error={errors.companions?.[index]?.lastName?.message}
                    onChange={(event) =>
                      form.setValue(
                        `companions.${index}.lastName`,
                        event.target.value,
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  />
                </div>
              ))}
              <p className="text-sm text-muted sm:col-span-2">
                {guestsLabel(selection.adults, selection.children)}. Crianças
                entram na conta, sem ficha própria.
              </p>
            </fieldset>
          ) : null}

          {step === 1 ? (
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 font-display text-2xl sm:col-span-2">
                Pagamento simulado
              </legend>
              <p className="text-sm text-muted sm:col-span-2">
                O número é validado no navegador e não é enviado à API.
              </p>
              <TextField
                id="cardName"
                label="Nome no cartão"
                autoComplete="cc-name"
                wrapperClassName="sm:col-span-2"
                error={messageOf(errors, "cardName")}
                {...form.register("cardName")}
              />
              <TextField
                id="cardNumber"
                label="Número"
                inputMode="numeric"
                autoComplete="cc-number"
                wrapperClassName="sm:col-span-2"
                error={messageOf(errors, "cardNumber")}
                {...form.register("cardNumber", {
                  onChange: (event) => {
                    form.setValue(
                      "cardNumber",
                      maskCard(event.target.value as string),
                    );
                  },
                })}
              />
              <TextField
                id="expiry"
                label="Validade"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                error={messageOf(errors, "expiry")}
                {...form.register("expiry", {
                  onChange: (event) => {
                    form.setValue(
                      "expiry",
                      maskExpiry(event.target.value as string),
                    );
                  },
                })}
              />
              <TextField
                id="cvv"
                label="CVV"
                inputMode="numeric"
                autoComplete="cc-csc"
                error={messageOf(errors, "cvv")}
                hint="Fica só nesta tela."
                {...form.register("cvv", {
                  onChange: (event) => {
                    form.setValue(
                      "cvv",
                      (event.target.value as string)
                        .replace(/\D/g, "")
                        .slice(0, 4),
                    );
                  },
                })}
              />
            </fieldset>
          ) : null}

          {step === 2 ? (
            <fieldset>
              <legend className="mb-2 font-display text-2xl">Revisão</legend>
              <p className="text-sm">
                {selection.hotel.name}, {selection.room.name}.{" "}
                {formatDateBR(selection.checkIn)} a{" "}
                {formatDateBR(selection.checkOut)}. {form.watch("firstName")}{" "}
                {form.watch("lastName")} · {form.watch("email")}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <TextField
                  id="discount"
                  label="Código de desconto"
                  className="uppercase"
                  {...form.register("discountInput")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="sm:mt-7"
                  onClick={applyDiscount}
                >
                  Aplicar
                </Button>
              </div>
              <p className="mt-2 text-sm" aria-live="polite">
                {discountMessage}
              </p>
              {appliedCode ? (
                <button
                  type="button"
                  className="text-sm text-clay"
                  onClick={() => {
                    form.setValue("appliedCode", "");
                    setDiscountMessage("Código removido");
                  }}
                >
                  Remover {appliedCode}
                </button>
              ) : null}
              <div className="mt-4 lg:hidden">
                <PriceSummary quote={quote} />
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...form.register("terms")}
                />
                <span>Li e aceito os termos e condições.</span>
              </label>
              <Link
                href="/checkout/termos"
                className="mt-2 inline-block text-sm underline"
              >
                Ler o texto completo
              </Link>
              {messageOf(errors, "terms") ? (
                <p role="alert" className="mt-2 text-sm text-clay">
                  {messageOf(errors, "terms")}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {mutation.isError ? (
            <p role="alert" className="mt-4 text-sm text-clay">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Não foi possível criar a reserva."}{" "}
              Você pode tentar de novo.
            </p>
          ) : null}

          <div className="mt-6 flex justify-between gap-3">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((current) => current - 1)}
              >
                Voltar
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button type="button" onClick={() => void goNext()}>
                Continuar
              </Button>
            ) : (
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Confirmando reserva..."
                  : mutation.isError
                    ? "Tentar novamente"
                    : "Confirmar reserva"}
              </Button>
            )}
          </div>
          {submittedId ? (
            <p className="mt-4 text-sm">
              Reserva criada.{" "}
              <Link className="underline" href={`/confirmation/${submittedId}`}>
                Abrir confirmação
              </Link>
            </p>
          ) : null}
        </form>

        <aside className="h-fit rounded-3xl border border-line bg-paper p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl">{selection.hotel.name}</h2>
          <p className="mt-1 text-sm text-muted">{selection.room.name}</p>
          <p className="mt-2 text-sm">
            {formatDateBR(selection.checkIn)} —{" "}
            {formatDateBR(selection.checkOut)}
          </p>
          <p className="text-sm text-muted">
            {roomsLabel(selection.roomCount)} ·{" "}
            {guestsLabel(selection.adults, selection.children)}
          </p>
          <div className="mt-4">
            <PriceSummary quote={quote} />
          </div>
        </aside>
      </div>
    </Container>
  );
}
