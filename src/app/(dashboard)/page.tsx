import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import {
  Package,
  Tags,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatNumber, tintColor } from "@/lib/format";
import { RECENT_ITEMS_LIMIT } from "@/lib/constants";

async function getDashboardStats(userId: string) {
  const [
    totalItems,
    totalCategories,
    totalLocations,
    recentItems,
    totalValue,
    allItems,
  ] = await Promise.all([
    db.item.count({ where: { userId } }),
    db.category.count(),
    db.location.count(),
    db.item.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: RECENT_ITEMS_LIMIT,
      include: { category: true, location: true },
    }),
    db.item.aggregate({
      where: { userId },
      _sum: { buyPrice: true },
    }),
    db.item.findMany({
      where: { userId },
      select: { quantity: true, minQuantity: true },
    }),
  ]);

  // Calculate low stock items (where quantity <= minQuantity and minQuantity > 0)
  const lowStockItems = allItems.filter(
    (item) => item.minQuantity > 0 && item.quantity <= item.minQuantity
  ).length;

  return {
    totalItems,
    totalCategories,
    totalLocations,
    lowStockItems,
    recentItems,
    totalValue: totalValue._sum.buyPrice || 0,
  };
}

interface StatCardProps {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  href?: string;
}

function StatCard({ title, value, hint, icon: Icon, href }: StatCardProps) {
  const card = (
    <Card
      className={
        href
          ? "hover:border-ring/60 h-full gap-4 transition-all hover:shadow-md"
          : "h-full gap-4"
      }
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="text-muted-foreground size-4" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block rounded-xl">
      {card}
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const stats = await getDashboardStats(session.user.id);

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session.user.name || session.user.email}`}
        actions={
          <Button asChild>
            <Link href="/items/new">
              <Plus className="size-4" aria-hidden="true" />
              Add item
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total items"
          value={formatNumber(stats.totalItems)}
          hint="Items in your inventory"
          icon={Package}
          href="/items"
        />
        <StatCard
          title="Total value"
          value={formatCurrency(stats.totalValue)}
          hint="Combined inventory value"
          icon={TrendingUp}
        />
        <StatCard
          title="Categories"
          value={formatNumber(stats.totalCategories)}
          hint="Active categories"
          icon={Tags}
          href="/categories"
        />
        <StatCard
          title="Locations"
          value={formatNumber(stats.totalLocations)}
          hint="Storage locations"
          icon={MapPin}
          href="/locations"
        />
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Card className="border-warning/40 bg-warning/5 gap-3">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="text-warning size-5" aria-hidden="true" />
            <CardTitle className="text-warning text-base font-semibold">
              Low stock alert
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-muted-foreground text-sm">
              {stats.lowStockItems === 1
                ? "1 item is at or below its minimum stock level."
                : `${formatNumber(stats.lowStockItems)} items are at or below their minimum stock level.`}
            </p>
            <Button variant="link" size="sm" className="h-auto p-0" asChild>
              <Link href="/items?filter=low-stock">
                View items
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Recent items</CardTitle>
          {stats.recentItems.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/items">
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {stats.recentItems.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No items yet"
              description="Add your first item to start tracking quantities, locations and value."
              action={
                <Button asChild size="sm">
                  <Link href="/items/new">
                    <Plus className="size-4" aria-hidden="true" />
                    Add your first item
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-border -my-2 divide-y">
              {stats.recentItems.map((item) => (
                <li
                  key={item.id}
                  className="hover:bg-muted/40 -mx-2 flex flex-wrap items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/items/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                      {item.category && (
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: tintColor(item.category.color),
                            color: item.category.color,
                          }}
                        >
                          {item.category.name}
                        </Badge>
                      )}
                      {item.location && <span>{item.location.name}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium tabular-nums">
                      {formatCurrency(item.buyPrice)}
                    </div>
                    <div className="text-muted-foreground text-sm tabular-nums">
                      Qty {formatNumber(item.quantity)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
