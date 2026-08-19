"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { MoreHorizontal, Eye, Pencil, Trash2, QrCode, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Column } from "./columns";

/** Width reserved for the trailing actions column. */
const ACTIONS_COLUMN_WIDTH = "w-12";

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onShowQr?: (id: string) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  emptyTitle = "No items found",
  emptyDescription,
  emptyAction,
  onDelete,
  onView,
  onEdit,
  onShowQr,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <Table>
      <TableHeader className="bg-muted/40">
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn("px-4", column.align === "right" && "text-right")}
            >
              {column.header}
            </TableHead>
          ))}
          <TableHead className={cn("px-4", ACTIONS_COLUMN_WIDTH)}>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className={cn(
                  "px-4 py-3",
                  column.align === "right" && "text-right tabular-nums"
                )}
              >
                {column.cell(item)}
              </TableCell>
            ))}
            <TableCell className="px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Open row actions"
                  >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(item.id)}>
                      <Eye className="mr-2 size-4" aria-hidden="true" />
                      View
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(item.id)}>
                      <Pencil className="mr-2 size-4" aria-hidden="true" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onShowQr && (
                    <DropdownMenuItem onClick={() => onShowQr(item.id)}>
                      <QrCode className="mr-2 size-4" aria-hidden="true" />
                      Show QR code
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
