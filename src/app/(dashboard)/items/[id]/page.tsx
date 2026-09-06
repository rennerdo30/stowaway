import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Pencil, ArrowLeft, QrCode, Barcode, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ItemActions } from "@/components/items/item-actions";
import {
  DATE_FORMAT_DATE_TIME,
  DATE_FORMAT_LONG,
  formatCurrency,
  formatNumber,
  tintColor,
} from "@/lib/format";
import { EMPTY_VALUE } from "@/lib/constants";

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

export async function generateMetadata({ params }: ItemPageProps) {
  const session = await auth();
  if (!session?.user) return {};

  const { id } = await params;
  const item = await getItem(id, session.user.id);

  return { title: item?.name };
}

/** Label/value pair used by the detail cards. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
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
    <PageShell>
      <PageHeader
        title={item.name}
        description={item.manufacturer || undefined}
        leading={
          <Button variant="ghost" size="icon" aria-label="Back to items" asChild>
            <Link href="/items">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        }
        actions={
          <>
            <ItemActions itemId={item.id} />
            <Button asChild>
              <Link href={`/items/${item.id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {item.description && (
                <Field label="Description">
                  <p className="whitespace-pre-line">{item.description}</p>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  {item.category ? (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: tintColor(item.category.color),
                        color: item.category.color,
                      }}
                    >
                      {item.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">{EMPTY_VALUE}</span>
                  )}
                </Field>

                <Field label="Location">
                  {item.location?.name ?? (
                    <span className="text-muted-foreground">{EMPTY_VALUE}</span>
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Buy price">
                  <p className="text-xl font-semibold tabular-nums">
                    {formatCurrency(item.buyPrice)}
                  </p>
                </Field>

                <Field label="Buy date">
                  <p className="tabular-nums">
                    {format(new Date(item.buyDate), DATE_FORMAT_LONG)}
                  </p>
                </Field>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Inventory</CardTitle>
            {isLowStock && (
              <Badge
                variant="outline"
                className="border-warning/40 text-warning bg-warning/10"
              >
                <AlertTriangle className="size-3" aria-hidden="true" />
                Low stock
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Quantity">
                  <p
                    className={`text-2xl font-semibold tabular-nums ${
                      isLowStock ? "text-warning" : ""
                    }`}
                  >
                    {formatNumber(item.quantity)}
                  </p>
                </Field>

                <Field label="Minimum quantity">
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatNumber(item.minQuantity)}
                  </p>
                </Field>
              </div>

              <Field label="Total value">
                <p className="text-xl font-semibold tabular-nums">
                  {formatCurrency(item.buyPrice * item.quantity)}
                </p>
              </Field>
            </dl>
          </CardContent>
        </Card>

        {item.barcode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Barcode className="size-4" aria-hidden="true" />
                Barcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="bg-muted block rounded-md px-3 py-2 text-center font-mono text-lg tracking-wider">
                {item.barcode}
              </code>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="size-4" aria-hidden="true" />
              QR code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Scan this QR code to quickly open this item on another device.
            </p>
            <ItemActions itemId={item.id} showQrOnly />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <Field label="ID">
              <p className="font-mono text-xs break-all">{item.id}</p>
            </Field>
            <Field label="Created">
              <p className="tabular-nums">
                {format(new Date(item.createdAt), DATE_FORMAT_DATE_TIME)}
              </p>
            </Field>
            <Field label="Updated">
              <p className="tabular-nums">
                {format(new Date(item.updatedAt), DATE_FORMAT_DATE_TIME)}
              </p>
            </Field>
          </dl>
        </CardContent>
      </Card>
    </PageShell>
  );
}
