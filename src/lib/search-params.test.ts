import { describe, expect, it } from "vitest";
import {
  buildSearchHref,
  EMPTY_FILTERS,
  parseSearchState,
} from "@/lib/search-params";

describe("estado da URL de busca", () => {
  it("normaliza filtros e ignora comodidade desconhecida", () => {
    const params = new URLSearchParams(
      "destination=Rio+de+Janeiro,+RJ&checkIn=2026-12-01&checkOut=2026-12-05&rooms=9&amenities=wifi,pool,inexistente&sort=price_asc&rating=4&minPrice=200&maxPrice=900",
    );
    const state = parseSearchState(params, "2026-11-16");
    expect(state.criteria.destination).toBe("Rio de Janeiro, RJ");
    expect(state.criteria.rooms).toBe(4);
    expect(state.filters.amenities).toEqual(["wifi", "pool"]);
    expect(state.filters.sort).toBe("price_asc");
    expect(state.filters.minRating).toBe(4);
    expect(state.dateIssues).toEqual([]);
  });

  it("recompõe um link compartilhável", () => {
    const href = buildSearchHref(
      {
        destination: "Salvador, BA",
        checkIn: "2026-12-10",
        checkOut: "2026-12-13",
        rooms: 1,
        adults: 2,
        children: 1,
      },
      { ...EMPTY_FILTERS, amenities: ["wifi", "parking"], page: 2 },
    );
    const state = parseSearchState(
      new URLSearchParams(href.split("?")[1]),
      "2026-11-16",
    );
    expect(state.criteria.destination).toBe("Salvador, BA");
    expect(state.criteria.children).toBe(1);
    expect(state.filters.amenities).toEqual(["wifi", "parking"]);
    expect(state.filters.page).toBe(2);
  });
});
