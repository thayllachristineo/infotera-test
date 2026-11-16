import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { GuestPicker } from "@/components/search/guest-picker";

function Harness() {
  const [value, setValue] = useState({ rooms: 1, adults: 2, children: 0 });
  return (
    <GuestPicker
      rooms={value.rooms}
      adults={value.adults}
      childCount={value.children}
      onChange={setValue}
    />
  );
}

describe("GuestPicker", () => {
  it("aumenta quartos e crianças e fecha com Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Hóspedes" }));
    expect(screen.getByText("Quartos")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Aumentar Quartos" }));
    await user.click(screen.getByRole("button", { name: "Aumentar Crianças" }));
    expect(screen.getByRole("button", { name: "Hóspedes" })).toHaveTextContent(
      "2 quartos · 2 adultos",
    );
    expect(screen.getByRole("button", { name: "Hóspedes" })).toHaveTextContent(
      "1 criança",
    );

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Quartos")).not.toBeInTheDocument();
  });

  it("não reduz adultos abaixo de um", async () => {
    const user = userEvent.setup();
    render(
      <GuestPicker
        rooms={1}
        adults={1}
        childCount={0}
        onChange={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Hóspedes" }));
    expect(
      screen.getByRole("button", { name: "Diminuir Adultos" }),
    ).toBeDisabled();
  });
});
