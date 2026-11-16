import type { StayDateIssue } from "@/types/search";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Data local, sem deslocar um dia por causa de UTC. */
export function parseISODate(iso: string): Date | null {
  const match = ISO_DATE.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(now = new Date()): string {
  return formatISODate(now);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  if (!date) {
    throw new Error(`Data inválida: ${iso}`);
  }
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function nightsBetween(
  checkIn: string,
  checkOut: string,
): number | null {
  const start = parseISODate(checkIn);
  const end = parseISODate(checkOut);
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function defaultStay(today = todayISO()): {
  checkIn: string;
  checkOut: string;
} {
  const checkIn = addDays(today, 14);
  return { checkIn, checkOut: addDays(checkIn, 3) };
}

/**
 * Regras da busca: check-in a partir de hoje, pelo menos uma noite,
 * no máximo 30 noites. Comparação lexicográfica funciona em YYYY-MM-DD.
 */
export function stayDateIssues(
  input: { checkIn: string; checkOut: string },
  today: string,
): StayDateIssue[] {
  const issues: StayDateIssue[] = [];

  if (!input.checkIn) {
    issues.push({ path: "checkIn", message: "Informe o check-in" });
  } else if (!parseISODate(input.checkIn)) {
    issues.push({
      path: "checkIn",
      message: "Informe uma data de check-in válida",
    });
  } else if (input.checkIn < today) {
    issues.push({
      path: "checkIn",
      message: "Check-in não pode ser no passado",
    });
  }

  if (!input.checkOut) {
    issues.push({ path: "checkOut", message: "Informe o check-out" });
  } else if (!parseISODate(input.checkOut)) {
    issues.push({
      path: "checkOut",
      message: "Informe uma data de check-out válida",
    });
  }

  if (issues.length > 0) return issues;

  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights === null || nights < 1) {
    issues.push({
      path: "checkOut",
      message: "Check-out deve ser pelo menos 1 dia após o check-in",
    });
  } else if (nights > 30) {
    issues.push({
      path: "checkOut",
      message: "A estadia máxima é de 30 noites",
    });
  }

  return issues;
}
