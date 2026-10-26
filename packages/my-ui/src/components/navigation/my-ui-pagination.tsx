import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "my-ui/ui/pagination";

type MyUiPaginationProps = {
  // 1-based
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  // Pages shown on each side of the current one
  siblings?: number;
  className?: string;
};

const pageList = (page: number, count: number, siblings: number): (number | "…")[] => {
  const pages = new Set([1, count]);
  for (let p = page - siblings; p <= page + siblings; p++) if (p >= 1 && p <= count) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["…", p] as const) : [p]));
};

export function MyUiPagination({ page, pageCount, onPageChange, siblings = 1, className }: MyUiPaginationProps) {
  if (pageCount <= 1) return null;
  const go = (target: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (target >= 1 && target <= pageCount && target !== page) onPageChange(target);
  };
  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={go(page - 1)} aria-disabled={page === 1} />
        </PaginationItem>
        {pageList(page, pageCount, siblings).map((p, index) => (
          <PaginationItem key={`${p}-${index}`}>
            {p === "…" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href="#" isActive={p === page} onClick={go(p)}>
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={go(page + 1)} aria-disabled={page === pageCount} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
