import { QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import { logError } from "@/lib/logger";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof ApiError && error.status === 404) return;
        logError("query", error, {
          key: query.queryKey
            .map((part) => (typeof part === "string" ? part : "obj"))
            .join("."),
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            (error.status === 404 || error.status === 400)
          ) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * No servidor cada render ganha um cliente novo, para não vazar cache
 * entre pedidos. No browser o mesmo cliente vive com a aba.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
