"use client";

import type { Item, Category, Location } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type ItemWithRelations = Item & {
  category: Category | null;
  location: Location | null;
};

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export const itemColumns: Column<ItemWithRelations>[] = [
  {
    key: "name",
    header: "Name",
    cell: (item) => (
      <div>
        <div className="font-medium">{item.name}</div>
        {item.manufacturer && (
          <div className="text-sm text-muted-foreground">{item.manufacturer}</div>
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
            backgroundColor: item.category.color + "20",
            color: item.category.color,
          }}
        >
          {item.category.name}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: "location",
    header: "Location",
    cell: (item) =>
      item.location ? (
        <span>{item.location.name}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: "quantity",
    header: "Qty",
    cell: (item) => {
      const isLowStock = item.minQuantity > 0 && item.quantity <= item.minQuantity;
      return (
        <span className={isLowStock ? "text-destructive font-medium" : ""}>
          {item.quantity}
          {isLowStock && " (Low)"}
        </span>
      );
    },
    sortable: true,
  },
  {
    key: "buyPrice",
    header: "Price",
    cell: (item) => <span>${item.buyPrice.toFixed(2)}</span>,
    sortable: true,
  },
  {
    key: "buyDate",
    header: "Purchase Date",
    cell: (item) => <span>{format(new Date(item.buyDate), "MMM d, yyyy")}</span>,
    sortable: true,
  },
  {
    key: "barcode",
    header: "Barcode",
    cell: (item) =>
      item.barcode ? (
        <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.barcode}</code>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
];
