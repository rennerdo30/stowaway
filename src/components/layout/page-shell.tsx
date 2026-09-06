import * as React from "react";

import { cn } from "@/lib/utils";

interface PageShellProps extends React.ComponentProps<"div"> {
  /** Narrow the content column for form-style pages. */
  width?: "page" | "form";
}

/**
 * Standard page container: one max-width, one responsive gutter and one
 * vertical rhythm for every route, so pages no longer drift apart.
 */
export function PageShell({
  className,
  width = "page",
  ...props
}: PageShellProps) {
  return (
    <div
      data-slot="page-shell"
      className={cn(
        "mx-auto w-full space-y-6 px-4 py-6 sm:px-6 lg:py-8",
        width === "page" ? "max-w-page" : "max-w-form",
        className
      )}
      {...props}
    />
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Primary page actions, rendered on the trailing edge (stacked on mobile). */
  actions?: React.ReactNode;
  /** Optional leading element, e.g. a back button. */
  leading?: React.ReactNode;
}

/** Page title block with a consistent type scale and mobile-safe action row. */
export function PageHeader({
  title,
  description,
  actions,
  leading,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
