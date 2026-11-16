import { Icon } from "@/components/ui/icon";

function StarRow() {
  return (
    <span className="flex">
      <Icon name="star" className="h-4 w-4" />
      <Icon name="star" className="h-4 w-4" />
      <Icon name="star" className="h-4 w-4" />
      <Icon name="star" className="h-4 w-4" />
      <Icon name="star" className="h-4 w-4" />
    </span>
  );
}

export function StarRating({
  value,
  showValue = true,
}: {
  value: number;
  showValue?: boolean;
}) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className="inline-flex items-center gap-1.5"
      role="img"
      aria-label={`Nota ${value.toFixed(1)} de 5`}
    >
      <span className="relative text-line" aria-hidden>
        <StarRow />
        <span
          className="absolute inset-y-0 left-0 overflow-hidden text-gold"
          style={{ width: `${percent}%` }}
        >
          <StarRow />
        </span>
      </span>
      {showValue ? (
        <span className="text-sm font-medium">{value.toFixed(1)}</span>
      ) : null}
    </span>
  );
}
