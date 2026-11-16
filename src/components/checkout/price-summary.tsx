import { formatBRL, nightsLabel, roomsLabel } from "@/lib/format";
import type { PriceQuote } from "@/types/api";

export function PriceSummary({ quote }: { quote: PriceQuote }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt>
          {formatBRL(quote.pricePerNight)} × {nightsLabel(quote.nights)} ×{" "}
          {roomsLabel(quote.roomCount)}
        </dt>
        <dd>{formatBRL(quote.base)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Taxa de serviço (10%)</dt>
        <dd>{formatBRL(quote.serviceFee)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Impostos (5%)</dt>
        <dd>{formatBRL(quote.taxes)}</dd>
      </div>
      {quote.discount > 0 ? (
        <div className="flex justify-between gap-4 text-pine">
          <dt>{quote.discountLabel ?? "Desconto"}</dt>
          <dd>− {formatBRL(quote.discount)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between gap-4 border-t border-line pt-2 text-base font-medium">
        <dt>Total</dt>
        <dd>{formatBRL(quote.total)}</dd>
      </div>
    </dl>
  );
}
