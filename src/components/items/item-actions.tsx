"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QrCode, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { QRCodeDisplay } from "@/components/qr/qr-code-display";

interface ItemActionsProps {
  itemId: string;
  showQrOnly?: boolean;
}

export function ItemActions({ itemId, showQrOnly = false }: ItemActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Item deleted successfully");
        router.push("/items");
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const qrUrl = typeof window !== "undefined"
    ? `${window.location.origin}/items/${itemId}`
    : `/items/${itemId}`;

  if (showQrOnly) {
    return (
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <QrCode className="size-4" aria-hidden="true" />
            Show QR code
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Item QR code</DialogTitle>
          </DialogHeader>
          <QRCodeDisplay value={qrUrl} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="More item actions">
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <QrCode className="mr-2 size-4" aria-hidden="true" />
              Show QR code
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Item QR code</DialogTitle>
            </DialogHeader>
            <QRCodeDisplay value={qrUrl} />
          </DialogContent>
        </Dialog>
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive"
        >
          <Trash2 className="mr-2 size-4" aria-hidden="true" />
          {isDeleting ? "Deleting…" : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
