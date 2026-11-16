"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import {
  AMENITIES,
  AMENITY_LABEL,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  PROPERTY_LABEL,
  PROPERTY_TYPES,
  RATING_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import { filtersAreActive } from "@/lib/search-params";
import type { Amenity, PropertyType } from "@/types/api";
import type {
  SearchFilters as HotelSearchFilters,
  SortKey,
} from "@/types/search";

function toggleItem<T extends string>(items: T[], value: T): T[] {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

function FilterFields({
  filters,
  onChange,
}: {
  filters: HotelSearchFilters;
  onChange: (partial: Partial<HotelSearchFilters>) => void;
}) {
  const [price, setPrice] = useState<[number, number]>([
    filters.minPrice,
    filters.maxPrice,
  ]);
  const priceRef = useRef(price);
  priceRef.current = price;

  useEffect(() => {
    const next: [number, number] = [filters.minPrice, filters.maxPrice];
    priceRef.current = next;
    setPrice(next);
  }, [filters.minPrice, filters.maxPrice]);

  function setRange(next: [number, number]) {
    priceRef.current = next;
    setPrice(next);
  }

  const left = ((price[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const right = 100 - ((price[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  function commit(next: [number, number]) {
    onChange({ minPrice: next[0], maxPrice: next[1] });
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="text-sm font-medium">Preço por noite</legend>
        <p className="mt-1 text-sm text-muted">
          {formatBRL(price[0])} — {formatBRL(price[1])}
        </p>
        <div className="relative mt-3 h-7">
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-line" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-pine"
            style={{ left: `${left}%`, right: `${right}%` }}
          />
          <input
            className="dual-range"
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={price[0]}
            aria-label="Preço mínimo"
            onChange={(event) => {
              const value = Math.min(
                Number(event.target.value),
                priceRef.current[1],
              );
              setRange([value, priceRef.current[1]]);
            }}
            onMouseUp={() => commit(priceRef.current)}
            onTouchEnd={() => commit(priceRef.current)}
            onKeyUp={() => commit(priceRef.current)}
          />
          <input
            className="dual-range z-[2]"
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={price[1]}
            aria-label="Preço máximo"
            onChange={(event) => {
              const value = Math.max(
                Number(event.target.value),
                priceRef.current[0],
              );
              setRange([priceRef.current[0], value]);
            }}
            onMouseUp={() => commit(priceRef.current)}
            onTouchEnd={() => commit(priceRef.current)}
            onKeyUp={() => commit(priceRef.current)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Avaliação mínima</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {RATING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 text-sm ring-1",
                filters.minRating === option.value
                  ? "bg-pine text-paper ring-pine"
                  : "bg-paper ring-line",
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name="rating"
                checked={filters.minRating === option.value}
                onChange={() => onChange({ minRating: option.value })}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Tipo</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => {
            const checked = filters.propertyTypes.includes(type);
            return (
              <label
                key={type}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 text-sm ring-1",
                  checked
                    ? "bg-pine text-paper ring-pine"
                    : "bg-paper ring-line",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() =>
                    onChange({
                      propertyTypes: toggleItem<PropertyType>(
                        filters.propertyTypes,
                        type,
                      ),
                    })
                  }
                />
                {PROPERTY_LABEL[type]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Comodidades</legend>
        <p className="mt-1 text-xs text-muted">
          A API trata a seleção como “qualquer uma”. Vários itens ampliam o
          resultado.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => {
            const checked = filters.amenities.includes(amenity);
            return (
              <label
                key={amenity}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 text-sm ring-1",
                  checked ? "bg-ink text-paper ring-ink" : "bg-paper ring-line",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() =>
                    onChange({
                      amenities: toggleItem<Amenity>(
                        filters.amenities,
                        amenity,
                      ),
                    })
                  }
                />
                {AMENITY_LABEL[amenity]}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export function SearchFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: HotelSearchFilters;
  onChange: (partial: Partial<HotelSearchFilters>) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = filtersAreActive(filters);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Filtros{active ? " · ativos" : ""}
        </Button>
      </div>
      <Dialog open={open} title="Filtros" onClose={() => setOpen(false)}>
        <FilterFields filters={filters} onChange={onChange} />
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="ghost" onClick={onClear} disabled={!active}>
            Limpar
          </Button>
          <Button onClick={() => setOpen(false)}>Ver resultados</Button>
        </div>
      </Dialog>
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-3xl border border-line bg-paper p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Filtros</h2>
            {active ? (
              <button
                type="button"
                className="text-sm text-clay"
                onClick={onClear}
              >
                Limpar
              </button>
            ) : null}
          </div>
          <FilterFields filters={filters} onChange={onChange} />
        </div>
      </aside>
    </>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Ordenar</span>
      <select
        className="rounded-full border border-line bg-paper px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
