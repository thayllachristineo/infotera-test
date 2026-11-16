import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HotelCard } from "@/components/search/hotel-card";
import { useFavoritesStore } from "@/stores/favorites-store";
import type { Hotel } from "@/types/api";
import type { SearchCriteria } from "@/types/search";

vi.mock("next/image", () => ({
  default: function MockImage({ alt }: { alt?: string }) {
    return <span role="img" aria-label={alt ?? ""} />;
  },
}));

vi.mock("next/link", () => ({
  default: function MockLink({
    href,
    children,
  }: {
    href: string;
    children: ReactNode;
  }) {
    return <a href={href}>{children}</a>;
  },
}));

vi.mock("@/lib/api/endpoints", () => ({
  getHotel: vi.fn(),
  getRooms: vi.fn(),
}));

const criteria: SearchCriteria = {
  destination: "São Paulo, SP",
  checkIn: "2026-12-01",
  checkOut: "2026-12-04",
  rooms: 1,
  adults: 2,
  children: 0,
};

function hotel(overrides: Partial<Hotel> = {}): Hotel {
  return {
    id: 7,
    name: "Hotel Moema Garden",
    slug: "hotel-moema-garden",
    destination: "São Paulo, SP",
    description: "Jardim",
    rating: 4.5,
    reviewCount: 12,
    pricePerNight: 820,
    currency: "BRL",
    propertyType: "hotel",
    address: "Moema",
    latitude: -23.6,
    longitude: -46.6,
    images: [],
    thumbnail: "https://images.unsplash.com/photo.jpg",
    amenities: ["wifi"],
    checkInTime: "15:00",
    checkOutTime: "12:00",
    cancellationPolicy: "free",
    availableRooms: 4,
    featured: false,
    ...overrides,
  };
}

describe("HotelCard", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ items: [], hydrated: true });
  });

  it("mostra o hotel e leva para a ficha com as datas da busca", () => {
    render(<HotelCard hotel={hotel()} criteria={criteria} />);

    expect(
      screen.getByRole("heading", { name: "Hotel Moema Garden" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/820,00/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver Hotel Moema Garden" }),
    ).toHaveAttribute("href", expect.stringContaining("/hotel/7"));
    expect(screen.queryByText("Esgotado")).not.toBeInTheDocument();
  });

  it("marca esgotado e salva nos favoritos", async () => {
    const user = userEvent.setup();
    render(
      <HotelCard hotel={hotel({ availableRooms: 0 })} criteria={criteria} />,
    );

    expect(screen.getByText("Esgotado")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Salvar Hotel Moema Garden" }),
    );
    expect(useFavoritesStore.getState().items.map((item) => item.id)).toEqual([
      7,
    ]);
    expect(
      screen.getByRole("button", {
        name: "Remover Hotel Moema Garden dos favoritos",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
