import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowLeft, QrCode, Barcode } from "lucide-react";
import { format } from "date-fns";
import { ItemActions } from "@/components/items/item-actions";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

async function getItem(id: string, userId: string) {
  const item = await db.item.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
      images: true,
    },
  });

  if (!item || item.userId !== userId) {
    return null;
  }

  return item;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const item = await getItem(id, session.user.id);

  if (!item) {
    notFound();
  }

  const isLowStock = item.minQuantity > 0 && item.quantity <= item.minQuantity;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/items">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{item.name}</h1>
            {item.manufacturer && (
              <p className="text-muted-foreground">{item.manufacturer}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <ItemActions itemId={item.id} />
          <Button asChild>
            <Link href={`/items/${item.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </h3>
                <p>{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Category
                </h3>
                {item.category ? (
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
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Location
                </h3>
                <p>{item.location?.name || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Buy Price
                </h3>
                <p className="text-xl font-semibold">${item.buyPrice.toFixed(2)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Buy Date
                </h3>
                <p>{format(new Date(item.buyDate), "MMMM d, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Quantity
                </h3>
                <p className={`text-2xl font-bold ${isLowStock ? "text-destructive" : ""}`}>
                  {item.quantity}
                </p>
                {isLowStock && (
                  <p className="text-sm text-destructive">Low stock warning</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Minimum Quantity
                </h3>
                <p className="text-xl">{item.minQuantity}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Total Value
              </h3>
              <p className="text-xl font-semibold">
                ${(item.buyPrice * item.quantity).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {item.barcode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Barcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-lg bg-muted px-3 py-2 rounded block text-center">
                {item.barcode}
              </code>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Scan this QR code to quickly access this item.
            </p>
            <ItemActions itemId={item.id} showQrOnly />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>
              <p className="font-mono text-xs">{item.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p>{format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <p>{format(new Date(item.updatedAt), "MMM d, yyyy HH:mm")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
