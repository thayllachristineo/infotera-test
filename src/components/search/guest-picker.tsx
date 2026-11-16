"use client";

import { useEffect, useId, useRef, useState } from "react";
import { controlClass } from "@/components/ui/field";
import { guestsLabel, roomsLabel } from "@/lib/format";

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="h-9 w-9 rounded-full border border-line"
          aria-label={`Diminuir ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          −
        </button>
        <span className="w-6 text-center text-sm" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className="h-9 w-9 rounded-full border border-line"
          aria-label={`Aumentar ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function GuestPicker({
  rooms,
  adults,
  childCount,
  onChange,
}: {
  rooms: number;
  adults: number;
  childCount: number;
  onChange: (next: { rooms: number; adults: number; children: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonId = useId();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative min-w-0">
      <span id={buttonId} className="mb-1.5 block text-sm font-medium">
        Hóspedes
      </span>
      <button
        type="button"
        className={`${controlClass} text-left`}
        aria-labelledby={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {roomsLabel(rooms)} · {guestsLabel(adults, childCount)}
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute z-30 mt-2 w-full min-w-64 rounded-2xl border border-line bg-paper p-3 shadow-xl"
        >
          <Stepper
            label="Quartos"
            value={rooms}
            min={1}
            max={4}
            onChange={(value) =>
              onChange({ rooms: value, adults, children: childCount })
            }
          />
          <Stepper
            label="Adultos"
            value={adults}
            min={1}
            max={8}
            onChange={(value) =>
              onChange({ rooms, adults: value, children: childCount })
            }
          />
          <Stepper
            label="Crianças"
            value={childCount}
            min={0}
            max={6}
            onChange={(value) => onChange({ rooms, adults, children: value })}
          />
          <p className="pt-1 text-xs text-muted">
            O ideal é pelo menos um adulto por quarto. Crianças contam na
            capacidade do quarto.
          </p>
        </div>
      ) : null}
    </div>
  );
}
