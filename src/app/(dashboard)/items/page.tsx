"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  SlidersHorizontal,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/items/data-table";
import { itemColumns } from "@/components/items/columns";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/format";
import { ITEMS_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { Item, Category, Location } from "@prisma/client";

type ItemWithRelations = Item & {
  category: Category | null;
  location: Location | null;
};

interface ItemsResponse {
  items: ItemWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Sentinel used by the selects, because Radix cannot hold an empty value. */
const ALL_OPTION = "all";
const LOW_STOCK_FILTER = "low-stock";
const FIRST_PAGE = 1;

function ItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") || ""
  );
  const [locationId, setLocationId] = useState(
    searchParams.get("locationId") || ""
  );
  const [lowStock, setLowStock] = useState(
    searchParams.get("filter") === LOW_STOCK_FILTER
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [page, setPage] = useState(FIRST_PAGE);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });

  // Typing should not fire a request per keystroke.
  useEffect(() => {
    const timeoutId = setTimeout(
      () => setSearch(searchInput),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Any filter change starts again from the first page, otherwise a narrower
  // result set can land the user on a page that no longer exists.
  useEffect(() => {
    setPage(FIRST_PAGE);
  }, [search, categoryId, locationId, lowStock]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      if (locationId) params.set("locationId", locationId);
      if (lowStock) params.set("lowStock", "true");
      params.set("page", page.toString());
      params.set("limit", ITEMS_PAGE_SIZE.toString());

      const response = await fetch(`/api/items?${params}`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data: ItemsResponse = await response.json();
      setItems(data.items);
      setMeta({
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });
    } catch (fetchError) {
      console.error("Error fetching items:", fetchError);
      setItems([]);
      setError("We could not load your items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, locationId, lowStock, page]);

  const fetchFilters = useCallback(async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/locations"),
      ]);
      const [categoriesData, locationsData] = await Promise.all([
        categoriesRes.json(),
        locationsRes.json(),
      ]);
      setCategories(categoriesData.categories || []);
      setLocations(locationsData.locations || []);
    } catch (fetchError) {
      console.error("Error fetching filters:", fetchError);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchItems();
      }
    } catch (deleteError) {
      console.error("Error deleting item:", deleteError);
    }
  };

  const hasActiveFilters =
    Boolean(search) || Boolean(categoryId) || Boolean(locationId) || lowStock;

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategoryId("");
    setLocationId("");
    setLowStock(false);
  };

  const firstRowOnPage = (page - 1) * ITEMS_PAGE_SIZE + 1;
  const lastRowOnPage = Math.min(page * ITEMS_PAGE_SIZE, meta.total);

  return (
    <PageShell>
      <PageHeader
        title="Items"
        description="Manage your inventory items"
        actions={
          <Button asChild>
            <Link href="/items/new">
              <Plus className="size-4" aria-hidden="true" />
              Add item
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="item-search">Search</Label>
              <div className="relative">
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  id="item-search"
                  type="search"
                  placeholder="Name, manufacturer, barcode…"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select
                value={categoryId || ALL_OPTION}
                onValueChange={(value) =>
                  setCategoryId(value === ALL_OPTION ? "" : value)
                }
              >
                <SelectTrigger id="item-category" className="w-full">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-location">Location</Label>
              <Select
                value={locationId || ALL_OPTION}
                onValueChange={(value) =>
                  setLocationId(value === ALL_OPTION ? "" : value)
                }
              >
                <SelectTrigger id="item-location" className="w-full">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 sm:pb-2 xl:self-end">
              <Checkbox
                id="low-stock"
                checked={lowStock}
                onCheckedChange={(checked) => setLowStock(checked === true)}
              />
              <Label htmlFor="low-stock" className="font-normal">
                Low stock only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        {loading ? (
          <TableSkeleton columns={itemColumns.length} />
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Something went wrong"
            description={error}
            action={
              <Button variant="outline" size="sm" onClick={() => fetchItems()}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Try again
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={itemColumns}
            data={items}
            emptyDescription={
              hasActiveFilters
                ? "No items match the current filters. Try clearing them."
                : "Add your first item to start tracking quantities, locations and value."
            }
            emptyAction={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Clear filters
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link href="/items/new">
                    <Plus className="size-4" aria-hidden="true" />
                    Add your first item
                  </Link>
                </Button>
              )
            }
            onDelete={handleDelete}
            onView={(id) => router.push(`/items/${id}`)}
            onEdit={(id) => router.push(`/items/${id}/edit`)}
          />
        )}
      </Card>

      <div
        className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row"
        aria-live="polite"
      >
        <p className="text-muted-foreground text-sm tabular-nums">
          {loading || error
            ? ""
            : meta.total === 0
              ? "No items"
              : `Showing ${formatNumber(firstRowOnPage)}–${formatNumber(
                  lastRowOnPage
                )} of ${formatNumber(meta.total)} items`}
        </p>
        {meta.totalPages > 1 && (
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              disabled={page === FIRST_PAGE}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <span className="text-muted-foreground px-1 text-sm tabular-nums">
              {`${formatNumber(page)} / ${formatNumber(meta.totalPages)}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </nav>
        )}
      </div>
    </PageShell>
  );
}

function ItemsLoading() {
  return (
    <PageShell>
      <PageHeader title="Items" description="Manage your inventory items" />
      <Card className="overflow-hidden py-0">
        <TableSkeleton columns={itemColumns.length} />
      </Card>
    </PageShell>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<ItemsLoading />}>
      <ItemsContent />
    </Suspense>
  );
}
