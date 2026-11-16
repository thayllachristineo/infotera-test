import { cn } from "@/lib/cn";

type IconName =
  | "search"
  | "heart"
  | "heart-filled"
  | "star"
  | "share"
  | "close"
  | "chevron-left"
  | "chevron-right"
  | "pin"
  | "users"
  | "calendar";

/**
 * Ícones decorativos. O nome acessível fica no botão que usa o ícone.
 */
export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const props = {
    viewBox: "0 0 24 24",
    className: cn("h-5 w-5", className),
    "aria-hidden": true,
    fill: name === "heart-filled" || name === "star" ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: name === "heart-filled" || name === "star" ? 0 : 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "search":
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.2-3.2" />
        </svg>
      );
    case "heart":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
        </svg>
      );
    case "heart-filled":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
        </svg>
      );
    case "star":
      return (
        <svg {...props} aria-hidden="true">
          <path d="m12 3 2.4 5.2 5.6.6-4.2 3.8 1.2 5.5L12 15.8 6.9 18.1l1.2-5.5L4 8.8l5.6-.6L12 3z" />
        </svg>
      );
    case "share":
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="6" cy="12" r="2" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="16" cy="17" r="2" />
          <path d="m8 11 6-3M8 13l6 3" />
        </svg>
      );
    case "close":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M15 5 8 12l7 7" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...props} aria-hidden="true">
          <path d="m9 5 7 7-7 7" />
        </svg>
      );
    case "pin":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      );
    case "users":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M16 20v-1.2A3.8 3.8 0 0 0 12.2 15H7.8A3.8 3.8 0 0 0 4 18.8V20" />
          <circle cx="10" cy="8" r="3" />
          <path d="M20 20v-1.2A3.5 3.5 0 0 0 17 15.5M15 5.2a3 3 0 0 1 0 5.6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props} aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    default:
      return null;
  }
}
