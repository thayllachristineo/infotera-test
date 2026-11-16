import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export const controlClass =
  "w-full rounded-2xl border border-line bg-paper px-3 py-2.5 text-base text-ink placeholder:text-muted";

type Shared = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

function Shell({
  id,
  label,
  error,
  hint,
  wrapperClassName,
  children,
}: Shared & { children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-clay">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  wrapperClassName,
  className,
  ...props
}: Shared & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Shell
      id={id}
      label={label}
      error={error}
      hint={hint}
      wrapperClassName={wrapperClassName}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={cn(controlClass, error && "border-clay", className)}
        {...props}
      />
    </Shell>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  wrapperClassName,
  className,
  children,
  ...props
}: Shared & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Shell
      id={id}
      label={label}
      error={error}
      hint={hint}
      wrapperClassName={wrapperClassName}
    >
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={cn(controlClass, error && "border-clay", className)}
        {...props}
      >
        {children}
      </select>
    </Shell>
  );
}
