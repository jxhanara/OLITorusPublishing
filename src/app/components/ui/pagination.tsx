import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { cn } from "./utils";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<"a">;

/**
 * Torus DS page number — 32px wide box, 12px vertical padding, 4px radius,
 * Open Sans SemiBold 14/16. Active fills primary blue (#0062F2) with white text.
 */
function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "inline-flex w-8 items-center justify-center rounded-[4px] py-3 text-sm font-semibold leading-4 outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-[#4CA6FF]",
        isActive
          ? "bg-[#0062F2] text-white shadow-[0px_2px_4px_0px_rgba(0,52,99,0.1)]"
          : "text-[var(--ol-text)] hover:bg-black/[0.05] dark:hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Prev/Next/First/Last — icon-only chevron controls (Torus DS pagination).
 * White when enabled; low-contrast grey when aria-disabled.
 */
const paginationNavClass = cn(
  "inline-flex size-6 items-center justify-center rounded-[4px] text-[var(--ol-text)] outline-none transition-colors",
  "hover:bg-black/[0.05] dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#4CA6FF]",
  "aria-disabled:text-[var(--ol-text-subtle)] aria-disabled:opacity-90 aria-disabled:hover:bg-transparent",
);

function PaginationFirst({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      aria-label="Go to first page"
      data-slot="pagination-first"
      className={cn(paginationNavClass, className)}
      {...props}
    >
      <ChevronsLeftIcon className="size-4" />
    </a>
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      aria-label="Go to previous page"
      data-slot="pagination-previous"
      className={cn(paginationNavClass, className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
    </a>
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      aria-label="Go to next page"
      data-slot="pagination-next"
      className={cn(paginationNavClass, className)}
      {...props}
    >
      <ChevronRightIcon className="size-4" />
    </a>
  );
}

function PaginationLast({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      aria-label="Go to last page"
      data-slot="pagination-last"
      className={cn(paginationNavClass, className)}
      {...props}
    >
      <ChevronsRightIcon className="size-4" />
    </a>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "inline-flex w-8 items-center justify-center py-3 text-sm font-semibold leading-4 text-[var(--ol-text)]",
        className,
      )}
      {...props}
    >
      …
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
  PaginationEllipsis,
};
