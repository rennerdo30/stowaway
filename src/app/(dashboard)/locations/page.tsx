"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatNumber } from "@/lib/format";
import { EMPTY_VALUE } from "@/lib/constants";

interface Location {
  id: string;
  name: string;
  description: string | null;
  _count: {
    items: number;
  };
}

const LOCATION_TABLE_COLUMNS = 4;
const DESCRIPTION_ROWS = 3;

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        description: location.description || "",
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLocation(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingLocation
        ? `/api/locations/${editingLocation.id}`
        : "/api/locations";
      const method = editingLocation ? "PUT" : "POST";

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
        editingLocation
          ? "Location updated successfully"
          : "Location created successfully"
      );
      handleCloseDialog();
      fetchLocations();
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? Items in this location will be unassigned.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Location deleted successfully");
        fetchLocations();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Locations"
        description="Manage storage locations for your items"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="size-4" aria-hidden="true" />
                Add location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLocation ? "Edit location" : "Add location"}
                </DialogTitle>
                <DialogDescription>
                  Locations describe where an item is physically stored.
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
                    placeholder="e.g. Warehouse A, Shelf 1"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Additional details about this location"
                    rows={DESCRIPTION_ROWS}
                  />
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
                      : editingLocation
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
            <MapPin className="size-4" aria-hidden="true" />
            All locations
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton columns={LOCATION_TABLE_COLUMNS} />
          ) : locations.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No locations yet"
              description="Locations let you record where each item is stored, from a room to a single shelf."
              action={
                <Button size="sm" onClick={() => handleOpenDialog()}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add your first location
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="px-6">Name</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="px-6 text-right">Items</TableHead>
                  <TableHead className="w-24 px-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="px-6 py-3 font-medium">
                      {location.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs px-6 py-3 whitespace-normal">
                      {location.description || EMPTY_VALUE}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right tabular-nums">
                      {formatNumber(location._count.items)}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${location.name}`}
                          onClick={() => handleOpenDialog(location)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${location.name}`}
                          disabled={deletingId === location.id}
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDelete(location.id, location.name)
                          }
                        >
                          {deletingId === location.id ? (
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
