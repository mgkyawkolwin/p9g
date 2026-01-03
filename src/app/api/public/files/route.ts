import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import mime from "mime";

export async function GET(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ file: string }>;
    },
) {
    const { fileUrl } = Object.fromEntries(req.nextUrl.searchParams);
    console.log({fileUrl: fileUrl});
    const fileName = fileUrl.split("/").findLast(s => s.includes("."));
    console.log({fileName: fileName});
    const filePath = path.resolve(process.cwd(), `public/${fileUrl}`);
    console.log({filePath: filePath});
    if (!fs.existsSync(filePath)) {
        return new NextResponse("not found", { status: 400 });
    }
    const buffer = fs.readFileSync(filePath);
    const contentType = mime.getType(filePath) || "application/octet-stream";
    return new NextResponse(buffer, {
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${fileName}"`,
        },
    });
}