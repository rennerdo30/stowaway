"use client";

import type { Item, Category, Location } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DATE_FORMAT_MEDIUM,
  formatCurrency,
  formatNumber,
  tintColor,
} from "@/lib/format";
import { EMPTY_VALUE } from "@/lib/constants";

type ItemWithRelations = Item & {
  category: Category | null;
  location: Location | null;
};

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  /** Numeric columns are right-aligned for easier scanning. */
  align?: "left" | "right";
}

function NotSet() {
  return (
    <span className="text-muted-foreground" aria-label="Not set">
      {EMPTY_VALUE}
    </span>
  );
}

export const itemColumns: Column<ItemWithRelations>[] = [
  {
    key: "name",
    header: "Name",
    cell: (item) => (
      <div className="min-w-0">
        <div className="font-medium">{item.name}</div>
        {item.manufacturer && (
          <div className="text-muted-foreground text-sm">
            {item.manufacturer}
          </div>
        )}
      </div>
    ),
    sortable: true,
  },
  {
    key: "category",
    header: "Category",
    cell: (item) =>
      item.category ? (
        <Badge
          variant="secondary"
          style={{
            backgroundColor: tintColor(item.category.color),
            color: item.category.color,
          }}
        >
          {item.category.name}
        </Badge>
      ) : (
        <NotSet />
      ),
  },
  {
    key: "location",
    header: "Location",
    cell: (item) =>
      item.location ? <span>{item.location.name}</span> : <NotSet />,
  },
  {
    key: "quantity",
    header: "Qty",
    align: "right",
    cell: (item) => {
      const isLowStock =
        item.minQuantity > 0 && item.quantity <= item.minQuantity;
      return (
        <span className="inline-flex items-center gap-2">
          <span className={isLowStock ? "text-warning font-medium" : undefined}>
            {formatNumber(item.quantity)}
          </span>
          {isLowStock && (
            <Badge
              variant="outline"
              className="border-warning/40 text-warning bg-warning/10"
            >
              Low
            </Badge>
          )}
        </span>
      );
    },
    sortable: true,
  },
  {
    key: "buyPrice",
    header: "Price",
    align: "right",
    cell: (item) => <span>{formatCurrency(item.buyPrice)}</span>,
    sortable: true,
  },
  {
    key: "buyDate",
    header: "Purchase date",
    cell: (item) => (
      <span className="whitespace-nowrap">
        {format(new Date(item.buyDate), DATE_FORMAT_MEDIUM)}
      </span>
    ),
    sortable: true,
  },
  {
    key: "barcode",
    header: "Barcode",
    cell: (item) =>
      item.barcode ? (
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
          {item.barcode}
        </code>
      ) : (
        <NotSet />
      ),
  },
];
