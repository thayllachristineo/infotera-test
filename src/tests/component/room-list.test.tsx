import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RoomList } from "@/components/hotel/room-list";
import type { Room } from "@/types/api";

function room(overrides: Partial<Room> = {}): Room {
  return {
    id: 3,
    hotelId: 7,
    name: "Quarto jardim",
    description: "Cama queen",
    size: 28,
    maxGuests: 2,
    beds: [{ type: "queen", quantity: 1 }],
    pricePerNight: 820,
    amenities: ["aircon"],
    images: [],
    available: 2,
    ...overrides,
  };
}

describe("RoomList", () => {
  it("seleciona um quarto disponível", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <RoomList
        rooms={[room()]}
        adults={2}
        childCount={0}
        requestedRooms={1}
        canBook
        onSelect={onSelect}
      />,
    );

    expect(
      screen.getByText("Apenas 2 quartos disponíveis!"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Selecionar" }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3 }),
      1,
    );
  });

  it("bloqueia a seleção quando o quarto está esgotado ou sem datas", () => {
    const { rerender } = render(
      <RoomList
        rooms={[room({ available: 0 })]}
        adults={2}
        childCount={0}
        requestedRooms={1}
        canBook
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Selecionar" })).toBeDisabled();
    expect(screen.getByText("Esgotado")).toBeInTheDocument();

    rerender(
      <RoomList
        rooms={[room()]}
        adults={2}
        childCount={0}
        requestedRooms={1}
        canBook={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Selecionar" })).toBeDisabled();
    expect(
      screen.getByText("Defina datas válidas para selecionar."),
    ).toBeInTheDocument();
  });
});
