"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Tags, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatNumber, tintColor } from "@/lib/format";

interface Category {
  id: string;
  name: string;
  color: string;
  _count: {
    items: number;
  };
}

const PRESET_COLORS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#84cc16", label: "Lime" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#0ea5e9", label: "Sky" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#a855f7", label: "Purple" },
  { value: "#d946ef", label: "Fuchsia" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f43f5e", label: "Rose" },
] as const;

/** Default color for a new category (indigo-500, matches the Prisma default). */
const DEFAULT_CATEGORY_COLOR = "#6366f1";
const CATEGORY_TABLE_COLUMNS = 4;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: DEFAULT_CATEGORY_COLOR,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, color: category.color });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", color: DEFAULT_CATEGORY_COLOR });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", color: DEFAULT_CATEGORY_COLOR });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      toast.success(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? Items in this category will be unassigned.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Categories"
        description="Organize your items with color-coded categories"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="size-4" aria-hidden="true" />
                Add category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit category" : "Add category"}
                </DialogTitle>
                <DialogDescription>
                  Pick a name and a color used for the category badge.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Category name"
                    autoComplete="off"
                    required
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm leading-none font-medium">
                    Color
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => {
                      const isSelected = formData.color === color.value;
                      return (
                        <button
                          key={color.value}
                          type="button"
                          aria-label={color.label}
                          aria-pressed={isSelected}
                          className={cn(
                            "focus-visible:ring-ring/50 size-8 rounded-full border-2 transition-transform focus-visible:ring-[3px] focus-visible:outline-none",
                            isSelected
                              ? "border-foreground scale-110"
                              : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: color.value }}
                          onClick={() =>
                            setFormData({ ...formData, color: color.value })
                          }
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Label htmlFor="customColor" className="font-normal">
                      Custom
                    </Label>
                    <Input
                      id="customColor"
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="h-9 w-12 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-28 font-mono text-sm"
                      placeholder="#000000"
                      aria-label="Color hex value"
                    />
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <p className="text-sm leading-none font-medium">Preview</p>
                  <Badge
                    style={{
                      backgroundColor: tintColor(formData.color),
                      color: formData.color,
                    }}
                  >
                    {formData.name || "Category name"}
                  </Badge>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {isSubmitting
                      ? "Saving…"
                      : editingCategory
                        ? "Update"
                        : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tags className="size-4" aria-hidden="true" />
            All categories
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton columns={CATEGORY_TABLE_COLUMNS} />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Tags}
              title="No categories yet"
              description="Categories group your items and color their badges across the app."
              action={
                <Button size="sm" onClick={() => handleOpenDialog()}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add your first category
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="px-6">Name</TableHead>
                  <TableHead className="px-6">Color</TableHead>
                  <TableHead className="px-6 text-right">Items</TableHead>
                  <TableHead className="w-24 px-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="px-6 py-3">
                      <Badge
                        style={{
                          backgroundColor: tintColor(category.color),
                          color: category.color,
                        }}
                      >
                        {category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="border-border size-5 rounded-full border"
                          style={{ backgroundColor: category.color }}
                          aria-hidden="true"
                        />
                        <code className="text-muted-foreground font-mono text-xs">
                          {category.color}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right tabular-nums">
                      {formatNumber(category._count.items)}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${category.name}`}
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${category.name}`}
                          disabled={deletingId === category.id}
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDelete(category.id, category.name)
                          }
                        >
                          {deletingId === category.id ? (
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Trash2 className="size-4" aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
