import { cn } from "@/lib/cn";

export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  if (pages <= 1) return null;
  const items = Array.from({ length: pages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Paginação"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        className="rounded-full px-3 py-2 text-sm disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Anterior
      </button>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          aria-current={item === page ? "page" : undefined}
          className={cn(
            "h-10 w-10 rounded-full text-sm",
            item === page ? "bg-pine text-paper" : "hover:bg-paper",
          )}
          onClick={() => onPage(item)}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        className="rounded-full px-3 py-2 text-sm disabled:opacity-40"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Próxima
      </button>
    </nav>
  );
}
