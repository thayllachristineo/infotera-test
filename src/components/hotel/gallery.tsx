"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { IMAGE_BLUR } from "@/lib/images";

/**
 * Galeria com lightbox. Setas e Escape funcionam enquanto o modal está aberto.
 */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const photos = images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = photos[active] ?? photos[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setActive((index) => (index + 1) % photos.length);
      }
      if (event.key === "ArrowLeft") {
        setActive((index) => (index - 1 + photos.length) % photos.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  if (!current) {
    return (
      <div className="grid h-72 place-items-center rounded-3xl bg-line text-sm text-muted">
        Sem fotos
      </div>
    );
  }

  function step(delta: number) {
    setActive((index) => (index + delta + photos.length) % photos.length);
  }

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <button
          type="button"
          className="relative aspect-[4/3] overflow-hidden rounded-3xl"
          onClick={() => setOpen(true)}
        >
          <Image
            src={current}
            alt={`${name}, foto ${active + 1}`}
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR}
          />
          <span className="absolute right-3 bottom-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-paper">
            Ampliar
          </span>
        </button>
        <ul className="grid grid-cols-4 gap-2 lg:grid-cols-2">
          {photos.map((photo, index) => (
            <li key={photo}>
              <button
                type="button"
                aria-current={index === active ? "true" : undefined}
                aria-label={`Foto ${index + 1} de ${photos.length}`}
                className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-2 ${
                  index === active ? "ring-pine" : "ring-transparent"
                }`}
                onClick={() => {
                  setActive(index);
                  setOpen(true);
                }}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="160px"
                  loading="lazy"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        className="orla-dialog wide"
        aria-label={`Fotos de ${name}`}
        onClose={() => setOpen(false)}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="rounded-3xl bg-ink p-3 text-paper sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm">
              {active + 1} / {photos.length}
              <span className="ml-3 text-paper/70">
                Setas do teclado para navegar
              </span>
            </p>
            <button
              type="button"
              className="rounded-full px-3 py-1 text-sm"
              onClick={() => setOpen(false)}
            >
              Fechar
            </button>
          </div>
          <div className="relative aspect-[16/10]">
            <Image
              src={current}
              alt={`${name}, foto ${active + 1}`}
              fill
              sizes="90vw"
              className="rounded-2xl object-contain"
            />
          </div>
          <div className="mt-3 flex justify-between">
            <button
              type="button"
              className="rounded-full bg-paper/10 p-2"
              aria-label="Foto anterior"
              onClick={() => step(-1)}
            >
              <Icon name="chevron-left" />
            </button>
            <button
              type="button"
              className="rounded-full bg-paper/10 p-2"
              aria-label="Próxima foto"
              onClick={() => step(1)}
            >
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
