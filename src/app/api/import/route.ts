import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface ImportItem {
  name: string;
  description?: string | null;
  manufacturer?: string | null;
  barcode?: string | null;
  buyPrice?: number;
  buyDate?: string;
  quantity?: number;
  minQuantity?: number;
  category?: string | null;
  location?: string | null;
}

interface ImportData {
  data?: {
    items?: ImportItem[];
    categories?: Array<{ name: string; color?: string }>;
    locations?: Array<{ name: string; description?: string | null }>;
  };
}

function parseCSV(content: string): ImportItem[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
  const items: ImportItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const item: ImportItem = { name: "" };
    headers.forEach((header, index) => {
      const value = values[index] || "";
      switch (header) {
        case "name":
          item.name = value;
          break;
        case "description":
          item.description = value || null;
          break;
        case "manufacturer":
          item.manufacturer = value || null;
          break;
        case "barcode":
          item.barcode = value || null;
          break;
        case "buyprice":
        case "price":
          item.buyPrice = parseFloat(value) || 0;
          break;
        case "buydate":
        case "date":
          item.buyDate = value || undefined;
          break;
        case "quantity":
        case "qty":
          item.quantity = parseInt(value) || 1;
          break;
        case "minquantity":
        case "minqty":
          item.minQuantity = parseInt(value) || 0;
          break;
        case "category":
          item.category = value || null;
          break;
        case "location":
          item.location = value || null;
          break;
      }
    });

    if (item.name) {
      items.push(item);
    }
  }

  return items;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const content = await file.text();
    let items: ImportItem[] = [];
    let categories: Array<{ name: string; color?: string }> = [];
    let locations: Array<{ name: string; description?: string | null }> = [];

    if (file.name.endsWith(".json")) {
      try {
        const data: ImportData = JSON.parse(content);
        items = data.data?.items || [];
        categories = data.data?.categories || [];
        locations = data.data?.locations || [];
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON file" },
          { status: 400 }
        );
      }
    } else if (file.name.endsWith(".csv")) {
      items = parseCSV(content);
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Use JSON or CSV." },
        { status: 400 }
      );
    }

    // Import categories first
    const categoryMap = new Map<string, string>();
    for (const cat of categories) {
      if (!cat.name) continue;
      const existing = await db.category.findUnique({
        where: { name: cat.name },
      });
      if (existing) {
        categoryMap.set(cat.name, existing.id);
      } else {
        const created = await db.category.create({
          data: {
            name: cat.name,
            color: cat.color || "#6366f1",
          },
        });
        categoryMap.set(cat.name, created.id);
      }
    }

    // Import locations
    const locationMap = new Map<string, string>();
    for (const loc of locations) {
      if (!loc.name) continue;
      const existing = await db.location.findUnique({
        where: { name: loc.name },
      });
      if (existing) {
        locationMap.set(loc.name, existing.id);
      } else {
        const created = await db.location.create({
          data: {
            name: loc.name,
            description: loc.description,
          },
        });
        locationMap.set(loc.name, created.id);
      }
    }

    // Import items
    let itemsImported = 0;
    for (const item of items) {
      if (!item.name) continue;

      // Get or create category
      let categoryId: string | null = null;
      if (item.category) {
        if (categoryMap.has(item.category)) {
          categoryId = categoryMap.get(item.category)!;
        } else {
          const existing = await db.category.findUnique({
            where: { name: item.category },
          });
          if (existing) {
            categoryId = existing.id;
            categoryMap.set(item.category, existing.id);
          } else {
            const created = await db.category.create({
              data: { name: item.category },
            });
            categoryId = created.id;
            categoryMap.set(item.category, created.id);
          }
        }
      }

      // Get or create location
      let locationId: string | null = null;
      if (item.location) {
        if (locationMap.has(item.location)) {
          locationId = locationMap.get(item.location)!;
        } else {
          const existing = await db.location.findUnique({
            where: { name: item.location },
          });
          if (existing) {
            locationId = existing.id;
            locationMap.set(item.location, existing.id);
          } else {
            const created = await db.location.create({
              data: { name: item.location },
            });
            locationId = created.id;
            locationMap.set(item.location, created.id);
          }
        }
      }

      // Check for duplicate barcode
      if (item.barcode) {
        const existingBarcode = await db.item.findUnique({
          where: { barcode: item.barcode },
        });
        if (existingBarcode) {
          // Skip items with duplicate barcodes
          continue;
        }
      }

      await db.item.create({
        data: {
          name: item.name,
          description: item.description,
          manufacturer: item.manufacturer,
          barcode: item.barcode,
          buyPrice: item.buyPrice || 0,
          buyDate: item.buyDate ? new Date(item.buyDate) : new Date(),
          quantity: item.quantity || 1,
          minQuantity: item.minQuantity || 0,
          categoryId,
          locationId,
          userId: session.user.id,
        },
      });
      itemsImported++;
    }

    return NextResponse.json({
      success: true,
      itemsImported,
      categoriesImported: categories.length,
      locationsImported: locations.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}
