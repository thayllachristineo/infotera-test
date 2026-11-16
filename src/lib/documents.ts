export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** CPF com dígitos verificadores. Rejeita sequência repetida. */
export function isValidCpf(raw: string): boolean {
  const digits = onlyDigits(raw);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const check = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return check(9) === Number(digits[9]) && check(10) === Number(digits[10]);
}

/** Cartão pelo algoritmo de Luhn. Aceita 13 a 19 dígitos. */
export function isValidLuhn(raw: string): boolean {
  const digits = onlyDigits(raw);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let current = Number(digits[index]);
    if (doubleDigit) {
      current *= 2;
      if (current > 9) current -= 9;
    }
    sum += current;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

/**
 * Validade MM/AA. O cartão vale até o último instante do mês informado.
 * `now` entra como parâmetro para o teste não depender do relógio.
 */
export function isValidExpiry(value: string, now = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  return endOfMonth.getTime() >= now.getTime();
}

export function isValidBrPhone(raw: string): boolean {
  const digits = onlyDigits(raw);
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (digits.length === 11 && digits[2] !== "9") return false;
  return true;
}

export function isValidIntlPhone(raw: string): boolean {
  const digits = onlyDigits(raw);
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidPassport(raw: string): boolean {
  return /^[A-Za-z0-9]{5,15}$/.test(raw.trim());
}

export function maskPhone(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskCpf(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCard(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function maskExpiry(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
