import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "clay";
  size?: "sm" | "md" | "lg";
};

const VARIANTS = {
  primary: "bg-pine text-paper hover:bg-pine-deep",
  secondary: "border border-line bg-paper text-ink hover:border-pine",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  clay: "bg-clay text-paper hover:bg-clay/90",
} as const;

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
