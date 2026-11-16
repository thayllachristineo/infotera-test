import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PriceSummary } from "@/components/checkout/price-summary";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { ErrorState } from "@/components/ui/status";
import type { PriceQuote } from "@/types/api";

const quote: PriceQuote = {
  nights: 3,
  roomCount: 1,
  pricePerNight: 200,
  base: 600,
  serviceFee: 60,
  taxes: 30,
  discount: 0,
  discountCode: null,
  discountLabel: null,
  total: 690,
};

describe("unidades de interface", () => {
  it("dispara o clique do botão e usa type button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Buscar</Button>);

    const button = screen.getByRole("button", { name: "Buscar" });
    expect(button).toHaveAttribute("type", "button");
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("mostra a nota acessível e esconde o número quando pedido", () => {
    const { rerender } = render(<StarRating value={4} />);
    expect(
      screen.getByRole("img", { name: "Nota 4.0 de 5" }),
    ).toBeInTheDocument();
    expect(screen.getByText("4.0")).toBeInTheDocument();

    rerender(<StarRating value={4} showValue={false} />);
    expect(screen.queryByText("4.0")).not.toBeInTheDocument();
  });

  it("mostra o erro e chama a tentativa de novo", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="A busca falhou"
        message="Sem conexão"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Sem conexão");
    await user.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("detalha diárias, taxas e o desconto no resumo", () => {
    const { rerender } = render(<PriceSummary quote={quote} />);
    expect(screen.getByText("Taxa de serviço (10%)")).toBeInTheDocument();
    expect(screen.getByText("Impostos (5%)")).toBeInTheDocument();
    expect(screen.getByText("Total").parentElement).toHaveTextContent("690,00");
    expect(screen.queryByText(/ORLA10/)).not.toBeInTheDocument();

    rerender(
      <PriceSummary
        quote={{
          ...quote,
          discount: 60,
          discountCode: "ORLA10",
          discountLabel: "ORLA10 · 10% nas diárias",
          total: 630,
        }}
      />,
    );
    expect(
      screen.getByText("ORLA10 · 10% nas diárias").parentElement,
    ).toHaveTextContent("60,00");
    expect(screen.getByText("Total").parentElement).toHaveTextContent("630,00");
  });
});
