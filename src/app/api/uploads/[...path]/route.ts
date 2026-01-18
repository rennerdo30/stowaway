import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// GET /api/uploads/[...path] - Serve uploaded images
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { path: pathSegments } = await params;
    const filepath = path.join(UPLOAD_DIR, ...pathSegments);

    // Validate path doesn't escape upload directory
    const normalizedPath = path.normalize(filepath);
    const normalizedUploadDir = path.normalize(UPLOAD_DIR);
    if (!normalizedPath.startsWith(normalizedUploadDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = await readFile(filepath);
    const ext = path.extname(filepath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
