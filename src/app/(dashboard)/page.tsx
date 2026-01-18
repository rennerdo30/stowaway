import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tags, MapPin, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";

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
      take: 5,
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

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const stats = await getDashboardStats(session.user.id);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Items in your inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Active categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLocations}</div>
            <p className="text-xs text-muted-foreground">
              Storage locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base font-medium text-destructive">
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats.lowStockItems} item{stats.lowStockItems > 1 ? "s" : ""} below minimum stock level.{" "}
              <Link href="/items?filter=low-stock" className="text-primary hover:underline">
                View items
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Items</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items yet.{" "}
              <Link href="/items/new" className="text-primary hover:underline">
                Add your first item
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/items/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      {item.category && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: item.category.color + "20", color: item.category.color }}
                        >
                          {item.category.name}
                        </span>
                      )}
                      {item.location && <span>{item.location.name}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.buyPrice.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
