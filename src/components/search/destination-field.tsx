"use client";

import { useQuery } from "@tanstack/react-query";
import { type KeyboardEvent, useEffect, useId, useState } from "react";
import { controlClass } from "@/components/ui/field";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getSuggestions } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { cn } from "@/lib/cn";
import { SUGGESTION_LABEL } from "@/lib/constants";
import { matchesDestination } from "@/lib/text";
import type { Suggestion } from "@/types/api";

/**
 * Combobox de destinos. A busca espera 300ms e o `?q=` da API ignora acentos.
 * O valor do formulário só muda quando uma sugestão é escolhida.
 */
export function DestinationField({
  selected,
  onSelect,
  onTextChange,
  error,
}: {
  selected: string;
  onSelect: (destination: string) => void;
  onTextChange?: (value: string) => void;
  error?: string;
}) {
  const listId = useId();
  const inputId = useId();
  const [text, setText] = useState(selected);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const debounced = useDebouncedValue(text, 300);
  const short = text.trim().length < 2;
  const term = short ? "" : debounced.trim();
  const waiting = !short && text.trim() !== debounced.trim();

  useEffect(() => {
    setText(selected);
    onTextChange?.(selected);
  }, [selected, onTextChange]);

  const suggestions = useQuery({
    queryKey: queryKeys.suggestions(term),
    queryFn: () => getSuggestions(term),
    enabled: open,
    staleTime: 60_000,
  });

  const options = (suggestions.data ?? []).filter((option) =>
    matchesDestination(option, text),
  );
  const [trackedText, setTrackedText] = useState(text);
  if (trackedText !== text) {
    setTrackedText(text);
    setActive(0);
  }

  function choose(option: Suggestion) {
    setText(option.name);
    onTextChange?.(option.name);
    onSelect(option.name);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) =>
        Math.min(current + 1, Math.max(options.length - 1, 0)),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Escape") {
      setOpen(false);
    }
    const highlighted = options[active];
    if (event.key === "Enter" && open && highlighted) {
      event.preventDefault();
      choose(highlighted);
    }
  }

  const loading = open && (waiting || suggestions.isFetching);
  const showList =
    open &&
    (loading ||
      suggestions.isError ||
      text.trim().length === 0 ||
      options.length > 0 ||
      !short);

  return (
    <div className="relative">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        Destino
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && options[active]
            ? `${listId}-${options[active].id}`
            : undefined
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(controlClass, error && "border-clay")}
        placeholder="Para onde você vai?"
        value={text}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        onChange={(event) => {
          const value = event.target.value;
          setText(value);
          onTextChange?.(value);
          setOpen(true);
          if (value !== selected) onSelect("");
        }}
      />
      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-1.5 text-sm text-clay"
        >
          {error}
        </p>
      ) : null}
      {showList ? (
        <div
          id={listId}
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-paper py-1 shadow-xl"
        >
          {loading && options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">Buscando destinos...</p>
          ) : null}
          {suggestions.isError ? (
            <p className="px-3 py-2 text-sm">
              Não foi possível carregar destinos.{" "}
              <button
                type="button"
                className="underline"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void suggestions.refetch()}
              >
                Tentar de novo
              </button>
            </p>
          ) : null}
          {!loading && !suggestions.isError && options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">
              Nenhum destino encontrado
            </p>
          ) : null}
          {options.map((option, index) => (
            <button
              key={option.id}
              id={`${listId}-${option.id}`}
              type="button"
              aria-pressed={index === active}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
                index === active ? "bg-foam" : "hover:bg-sand",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(option)}
            >
              <span>{option.name}</span>
              <span className="text-muted">
                {SUGGESTION_LABEL[option.type]}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
