"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { DestinationField } from "@/components/search/destination-field";
import { GuestPicker } from "@/components/search/guest-picker";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { addDays, nightsBetween, parseISODate, todayISO } from "@/lib/dates";
import { formatDateBR, nightsLabel } from "@/lib/format";
import { type SearchFormValues, searchSchema } from "@/lib/schemas";
import { buildSearchHref, EMPTY_CRITERIA } from "@/lib/search-params";
import { useSearchMemoryStore } from "@/stores/search-memory-store";
import type { SearchCriteria } from "@/types/search";

function shift(iso: string, days: number): string | undefined {
  if (!parseISODate(iso)) return undefined;
  return addDays(iso, days);
}

function fieldMessage(
  message: string | undefined,
  dirty: boolean | undefined,
  submitCount: number,
): string | undefined {
  if (!message) return undefined;
  if (submitCount > 0 || dirty) return message;
  return undefined;
}

/**
 * Formulário da home e da barra de busca. Datas e hóspedes validam em tempo
 * real depois da primeira alteração. O rascunho fica no localStorage.
 */
export function SearchPanel({
  initial,
  variant,
  onSubmit,
  onDestinationTextChange,
}: {
  initial?: SearchCriteria;
  variant: "hero" | "bar";
  onSubmit?: (values: SearchCriteria) => void;
  onDestinationTextChange?: (value: string) => void;
}) {
  const router = useRouter();
  const hydrated = useSearchMemoryStore((state) => state.hydrated);
  const recent = useSearchMemoryStore((state) => state.recent);
  const restored = useRef(false);
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: initial ?? EMPTY_CRITERIA,
    mode: "onChange",
  });

  const initialKey = initial
    ? `${initial.destination}|${initial.checkIn}|${initial.checkOut}|${initial.rooms}|${initial.adults}|${initial.children}`
    : "";
  const initialRef = useRef(initial);
  initialRef.current = initial;

  useEffect(() => {
    const current = initialRef.current;
    if (current && initialKey) {
      form.reset(current);
      return;
    }
    if (!hydrated || restored.current) return;
    restored.current = true;
    const draft = useSearchMemoryStore.getState().draft;
    if (draft) form.reset(draft);
  }, [initialKey, hydrated, form]);

  const watched = useWatch({ control: form.control });

  useEffect(() => {
    if (!hydrated) return;
    const destination = watched.destination ?? "";
    const timeout = window.setTimeout(() => {
      const values = form.getValues();
      if (values.destination.length === 0 && destination.length === 0) {
        useSearchMemoryStore.getState().setDraft(values);
        return;
      }
      useSearchMemoryStore.getState().setDraft(values);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [watched, hydrated, form]);

  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null;
  const today = todayISO();
  const submitCount = form.formState.submitCount;
  const dirty = form.formState.dirtyFields;

  function message(name: "checkIn" | "checkOut"): string | undefined {
    const error = form.formState.errors[name]?.message;
    return fieldMessage(error, dirty[name], submitCount);
  }

  return (
    <div>
      <form
        aria-label="Buscar hotéis"
        className={cn(
          "relative z-20 rounded-3xl bg-paper p-4 text-ink shadow-xl sm:p-5",
          variant === "bar" && "shadow-none ring-1 ring-line",
        )}
        onSubmit={form.handleSubmit((values) => {
          useSearchMemoryStore.getState().remember(values);
          if (onSubmit) onSubmit(values);
          else router.push(buildSearchHref(values));
        })}
      >
        <div
          className={cn(
            "grid gap-3",
            variant === "bar"
              ? "lg:grid-cols-[minmax(0,1.3fr)_auto_auto_minmax(0,1fr)_auto] lg:items-end"
              : "md:grid-cols-2",
          )}
        >
          <div className={variant === "hero" ? "md:col-span-2" : undefined}>
            <Controller
              name="destination"
              control={form.control}
              render={({ field, fieldState }) => (
                <DestinationField
                  selected={field.value}
                  onSelect={field.onChange}
                  onTextChange={onDestinationTextChange}
                  error={fieldMessage(
                    fieldState.error?.message,
                    fieldState.isDirty,
                    submitCount,
                  )}
                />
              )}
            />
          </div>
          <div>
            <label
              htmlFor="check-in"
              className="mb-1.5 block text-sm font-medium"
            >
              Check-in
            </label>
            <input
              id="check-in"
              type="date"
              min={today}
              max={checkOut ? shift(checkOut, -1) : undefined}
              className={cn(controlClass, message("checkIn") && "border-clay")}
              aria-invalid={message("checkIn") ? true : undefined}
              aria-describedby={
                message("checkIn") ? "check-in-error" : undefined
              }
              {...form.register("checkIn")}
            />
            {message("checkIn") ? (
              <p
                id="check-in-error"
                role="alert"
                className="mt-1.5 text-sm text-clay"
              >
                {message("checkIn")}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="check-out"
              className="mb-1.5 block text-sm font-medium"
            >
              Check-out
            </label>
            <input
              id="check-out"
              type="date"
              min={checkIn ? shift(checkIn, 1) : today}
              max={checkIn ? shift(checkIn, 30) : undefined}
              className={cn(controlClass, message("checkOut") && "border-clay")}
              aria-invalid={message("checkOut") ? true : undefined}
              aria-describedby={
                message("checkOut") ? "check-out-error" : undefined
              }
              {...form.register("checkOut")}
            />
            {message("checkOut") ? (
              <p
                id="check-out-error"
                role="alert"
                className="mt-1.5 text-sm text-clay"
              >
                {message("checkOut")}
              </p>
            ) : null}
          </div>
          <Controller
            name="rooms"
            control={form.control}
            render={({ field }) => (
              <GuestPicker
                rooms={field.value}
                adults={form.watch("adults")}
                childCount={form.watch("children")}
                onChange={(next) => {
                  form.setValue("rooms", next.rooms, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue("adults", next.adults, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue("children", next.children, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            )}
          />
          <Button
            type="submit"
            size="lg"
            className={variant === "bar" ? "lg:mb-0" : "md:col-span-2"}
          >
            Buscar
          </Button>
        </div>
        {nights !== null && nights > 0 && nights <= 30 ? (
          <p className="mt-3 text-sm text-muted">{nightsLabel(nights)}</p>
        ) : null}
      </form>
      {variant === "hero" && recent.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-sm text-sand/90">Últimas buscas</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {recent.map((item) => (
              <li key={`${item.id}-${item.searchedAt}`}>
                <button
                  type="button"
                  className="rounded-full bg-paper/15 px-3 py-1.5 text-sm text-paper ring-1 ring-paper/30 hover:bg-paper/25"
                  onClick={() => {
                    useSearchMemoryStore.getState().remember(item);
                    router.push(buildSearchHref(item));
                  }}
                >
                  {item.destination} · {formatDateBR(item.checkIn)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
