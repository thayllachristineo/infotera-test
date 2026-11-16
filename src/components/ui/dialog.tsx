"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

/**
 * Modal nativo. `showModal` prende o foco e fecha com Escape.
 */
export function Dialog({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={wide ? "orla-dialog wide" : "orla-dialog"}
      aria-labelledby={titleId}
      onClose={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] overflow-auto rounded-3xl bg-paper p-5 text-ink shadow-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-2xl">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-full px-3 py-1 text-sm text-muted hover:bg-sand"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
