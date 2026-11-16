/**
 * Log estruturado para o console. Não inclui payload de formulário
 * (cartão, documento, e-mail) — só escopo, mensagem e contexto explícito.
 */
export function logError(
  scope: string,
  error: unknown,
  context?: Record<string, string | number | boolean | null>,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error("[orla]", {
    scope,
    message,
    stack,
    at: new Date().toISOString(),
    ...context,
  });
}
