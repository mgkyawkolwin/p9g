import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import mime from "mime";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("fileUrl"); // e.g., /uploads/uuid.jpg

    if (!fileUrl) {
        return new NextResponse("File URL is required", { status: 400 });
    }

    // Security check: Prevent Directory Traversal attacks
    // This ensures users can't request '../../etc/passwd'
    const normalizedPath = path.normalize(fileUrl).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(process.cwd(), normalizedPath);

    if (!fs.existsSync(filePath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    try {
        const buffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const contentType = mime.getType(filePath) || "application/octet-stream";

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${fileName}"`,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        return new NextResponse("Error reading file", { status: 500 });
    }
}