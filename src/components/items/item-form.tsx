"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, type ItemInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { BarcodeScanner } from "@/components/barcode/barcode-scanner";
import { CURRENCY_SYMBOL } from "@/lib/format";
import type { Item, Category, Location } from "@prisma/client";

type ItemWithRelations = Item & {
  category: Category | null;
  location: Location | null;
};

interface ItemFormProps {
  item?: ItemWithRelations;
  mode: "create" | "edit";
}

/** Sentinel value for the "no relation" option, Radix rejects empty strings. */
const NO_SELECTION = "none";
const DESCRIPTION_ROWS = 3;
const PRICE_STEP = "0.01";

/** Marks a field as required both visually and for assistive technology. */
function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-destructive">
        {" *"}
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

/** Inline validation message wired to its field via `aria-describedby`. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-destructive text-sm">
      {message}
    </p>
  );
}

export function ItemForm({ item, mode }: ItemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      manufacturer: item?.manufacturer || "",
      barcode: item?.barcode || "",
      buyPrice: item?.buyPrice || 0,
      buyDate: item?.buyDate
        ? new Date(item.buyDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      quantity: item?.quantity || 1,
      minQuantity: item?.minQuantity || 0,
      categoryId: item?.categoryId || null,
      locationId: item?.locationId || null,
    },
  });

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
    } catch (error) {
      console.error("Error fetching filters:", error);
      toast.error("Failed to load categories and locations");
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const onSubmit = async (data: ItemInput) => {
    setIsLoading(true);

    try {
      const url = mode === "create" ? "/api/items" : `/api/items/${item?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Something went wrong");
        return;
      }

      toast.success(
        mode === "create"
          ? "Item created successfully"
          : "Item updated successfully"
      );
      router.push(`/items/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    } finally {
      setIsLoading(false);
    }
  };

  const categoryId = watch("categoryId");
  const locationId = watch("locationId");

  const submitLabel = isLoading
    ? mode === "create"
      ? "Creating…"
      : "Saving…"
    : mode === "create"
      ? "Create item"
      : "Save changes";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name
                <RequiredMark />
              </Label>
              <Input
                id="name"
                placeholder="Item name"
                autoComplete="off"
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              <FieldError id="name-error" message={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="Manufacturer"
                autoComplete="off"
                {...register("manufacturer")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Item description"
              rows={DESCRIPTION_ROWS}
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId || NO_SELECTION}
                onValueChange={(value) =>
                  setValue("categoryId", value === NO_SELECTION ? null : value)
                }
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={locationId || NO_SELECTION}
                onValueChange={(value) =>
                  setValue("locationId", value === NO_SELECTION ? null : value)
                }
              >
                <SelectTrigger id="location" className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>No location</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="buyPrice">{`Buy price (${CURRENCY_SYMBOL})`}</Label>
              <Input
                id="buyPrice"
                type="number"
                inputMode="decimal"
                step={PRICE_STEP}
                min="0"
                className="tabular-nums"
                aria-invalid={Boolean(errors.buyPrice)}
                aria-describedby={
                  errors.buyPrice ? "buyPrice-error" : undefined
                }
                {...register("buyPrice", { valueAsNumber: true })}
              />
              <FieldError
                id="buyPrice-error"
                message={errors.buyPrice?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyDate">Buy date</Label>
              <Input
                id="buyDate"
                type="date"
                className="tabular-nums"
                {...register("buyDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (EAN/UPC)</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  placeholder="Barcode"
                  inputMode="numeric"
                  autoComplete="off"
                  {...register("barcode")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setScannerOpen(true)}
                  aria-label="Scan barcode with camera"
                >
                  <Camera className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                inputMode="numeric"
                min="0"
                className="tabular-nums"
                aria-invalid={Boolean(errors.quantity)}
                aria-describedby={
                  errors.quantity ? "quantity-error" : undefined
                }
                {...register("quantity", { valueAsNumber: true })}
              />
              <FieldError
                id="quantity-error"
                message={errors.quantity?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity">Minimum quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                inputMode="numeric"
                min="0"
                className="tabular-nums"
                aria-invalid={Boolean(errors.minQuantity)}
                aria-describedby={
                  errors.minQuantity
                    ? "minQuantity-hint minQuantity-error"
                    : "minQuantity-hint"
                }
                {...register("minQuantity", { valueAsNumber: true })}
              />
              <p id="minQuantity-hint" className="text-muted-foreground text-sm">
                Triggers a low stock alert when the quantity reaches this
                number. Use 0 to disable.
              </p>
              <FieldError
                id="minQuantity-error"
                message={errors.minQuantity?.message}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {submitLabel}
          </Button>
        </CardFooter>
      </Card>

      <BarcodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={(barcode) => setValue("barcode", barcode)}
      />
    </form>
  );
}
