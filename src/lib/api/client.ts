import { logError } from "@/lib/logger";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL não está definida. Copie .env.example para .env.local.",
    );
  }
  return url.replace(/\/$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request(
  path: string,
  init?: RequestInit,
): Promise<{ data: unknown; total: number | null }> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch (error) {
    logError("api.network", error, { path });
    throw new ApiError(
      "Não foi possível conectar à API. Confira se a mock-api está no ar.",
      0,
    );
  }

  if (!response.ok) {
    let message = `Falha na requisição (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (isRecord(body) && typeof body.error === "string") {
        message = body.error;
      }
    } catch {
      // corpo vazio ou não JSON
    }
    throw new ApiError(message, response.status);
  }

  const data: unknown = await response.json();
  const totalHeader = response.headers.get("X-Total-Count");
  const total = totalHeader === null ? null : Number(totalHeader);
  return {
    data,
    total: total !== null && Number.isFinite(total) ? total : null,
  };
}

export async function apiGet(
  path: string,
): Promise<{ data: unknown; total: number | null }> {
  return request(path);
}

export async function apiPost(path: string, body: unknown): Promise<unknown> {
  const result = await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return result.data;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
