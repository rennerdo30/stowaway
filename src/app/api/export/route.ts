import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    // Fetch all data
    const [items, categories, locations] = await Promise.all([
      db.item.findMany({
        where: { userId: session.user.id },
        include: {
          category: { select: { name: true } },
          location: { select: { name: true } },
        },
      }),
      db.category.findMany(),
      db.location.findMany(),
    ]);

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "ID",
        "Name",
        "Description",
        "Manufacturer",
        "Barcode",
        "Buy Price",
        "Buy Date",
        "Quantity",
        "Min Quantity",
        "Category",
        "Location",
        "Created At",
        "Updated At",
      ];

      const rows = items.map((item) => [
        item.id,
        item.name,
        item.description || "",
        item.manufacturer || "",
        item.barcode || "",
        item.buyPrice.toString(),
        item.buyDate.toISOString(),
        item.quantity.toString(),
        item.minQuantity.toString(),
        item.category?.name || "",
        item.location?.name || "",
        item.createdAt.toISOString(),
        item.updatedAt.toISOString(),
      ]);

      const escapeCSV = (value: string) => {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => escapeCSV(cell)).join(",")),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=inventory-export-${new Date().toISOString().split("T")[0]}.csv`,
        },
      });
    }

    // Generate JSON
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      data: {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          manufacturer: item.manufacturer,
          barcode: item.barcode,
          buyPrice: item.buyPrice,
          buyDate: item.buyDate.toISOString(),
          quantity: item.quantity,
          minQuantity: item.minQuantity,
          category: item.category?.name || null,
          location: item.location?.name || null,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
        categories: categories.map((cat) => ({
          name: cat.name,
          color: cat.color,
        })),
        locations: locations.map((loc) => ({
          name: loc.name,
          description: loc.description,
        })),
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=inventory-export-${new Date().toISOString().split("T")[0]}.json`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
