export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** "sao paulo" encontra "São Paulo, SP". Menos de 2 letras não filtra. */
export function matchesDestination(
  suggestion: { name: string; searchName: string },
  query: string,
): boolean {
  const typed = fold(query.trim());
  if (typed.length < 2) return true;
  return fold(`${suggestion.name} ${suggestion.searchName}`).includes(typed);
}
