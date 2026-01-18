import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { itemSchema } from "@/lib/validations";

// GET /api/items - List all items for the current user
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const locationId = searchParams.get("locationId");
    const lowStock = searchParams.get("lowStock") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { manufacturer: { contains: search } },
          { barcode: { contains: search } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(locationId && { locationId }),
    };

    const [items, total] = await Promise.all([
      db.item.findMany({
        where,
        include: {
          category: true,
          location: true,
          images: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.item.count({ where }),
    ]);

    // Filter low stock items if requested
    const filteredItems = lowStock
      ? items.filter((item) => item.minQuantity > 0 && item.quantity <= item.minQuantity)
      : items;

    return NextResponse.json({
      items: filteredItems,
      pagination: {
        page,
        limit,
        total: lowStock ? filteredItems.length : total,
        totalPages: Math.ceil((lowStock ? filteredItems.length : total) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = itemSchema.parse(body);

    // Check if barcode already exists
    if (validatedData.barcode) {
      const existingItem = await db.item.findUnique({
        where: { barcode: validatedData.barcode },
      });
      if (existingItem) {
        return NextResponse.json(
          { error: "An item with this barcode already exists" },
          { status: 400 }
        );
      }
    }

    const item = await db.item.create({
      data: {
        ...validatedData,
        buyDate: validatedData.buyDate ? new Date(validatedData.buyDate) : new Date(),
        userId: session.user.id,
      },
      include: {
        category: true,
        location: true,
        images: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
