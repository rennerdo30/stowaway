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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { BarcodeScanner } from "@/components/barcode/barcode-scanner";
import type { Item, Category, Location } from "@prisma/client";

type ItemWithRelations = Item & {
  category: Category | null;
  location: Location | null;
};

interface ItemFormProps {
  item?: ItemWithRelations;
  mode: "create" | "edit";
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

      toast.success(mode === "create" ? "Item created successfully" : "Item updated successfully");
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create Item" : "Edit Item"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Item name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="Manufacturer"
                {...register("manufacturer")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Item description"
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId || "none"}
                onValueChange={(value) => setValue("categoryId", value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
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
                value={locationId || "none"}
                onValueChange={(value) => setValue("locationId", value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No location</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="buyPrice">Buy Price ($)</Label>
              <Input
                id="buyPrice"
                type="number"
                step="0.01"
                min="0"
                {...register("buyPrice", { valueAsNumber: true })}
              />
              {errors.buyPrice && (
                <p className="text-sm text-destructive">{errors.buyPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyDate">Buy Date</Label>
              <Input
                id="buyDate"
                type="date"
                {...register("buyDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (EAN/UPC)</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  placeholder="Barcode"
                  {...register("barcode")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setScannerOpen(true)}
                  title="Scan barcode"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity">Minimum Quantity (Low Stock Alert)</Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                {...register("minQuantity", { valueAsNumber: true })}
              />
              {errors.minQuantity && (
                <p className="text-sm text-destructive">{errors.minQuantity.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create Item"
              : "Save Changes"}
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
