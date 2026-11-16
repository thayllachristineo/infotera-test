import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "experimental-edge";

/**
 * Sugestões no Edge. A mock-api continua sendo a origem, via NEXT_PUBLIC_API_URL.
 * O matcher limita o runtime a essa leitura; o restante do app fica no Node.
 */
export async function middleware(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL não está definida." },
      { status: 500 },
    );
  }

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const target = new URL("/suggestions", base);
  if (query) target.searchParams.set("q", query);

  const response = await fetch(target, {
    headers: { Accept: "application/json" },
  });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}

export const config = {
  matcher: "/api/sugestoes",
};
