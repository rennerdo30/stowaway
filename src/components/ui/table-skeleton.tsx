import { Skeleton } from "@/components/ui/skeleton";

/** Number of placeholder rows shown while a table loads. */
export const SKELETON_ROW_COUNT = 5;

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

/**
 * Row-shaped loading placeholder. Preserves the table's height so the layout
 * does not jump once the real rows arrive.
 */
export function TableSkeleton({
  columns,
  rows = SKELETON_ROW_COUNT,
}: TableSkeletonProps) {
  return (
    <div
      className="divide-border divide-y"
      role="status"
      aria-label="Loading data"
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 px-4 py-3"
          aria-hidden="true"
        >
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className="h-4 flex-1"
              style={{ opacity: 1 - rowIndex * 0.12 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
