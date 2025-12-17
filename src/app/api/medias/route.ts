// app/api/media/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import c from "@/lib/loggers/console/ConsoleLogger";
import Media from "@/core/models/domain/Media";
import IMediaService from "@/core/services/contracts/IMediaService";
import { TYPES } from "@/core/types";
import { container } from "@/core/di/dicontainer";
import { auth } from "@/app/auth";
import { CustomError } from "@/lib/errors";
import { HttpStatusCode } from "@/core/constants";
import ILogService from "@/core/services/contracts/ILogService";


export async function POST(request: NextRequest) {
    try {

        // mimic delay
        await new Promise((resolve) => setTimeout(resolve, (Math.random() * 10000) + 3000));
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const reservationId = formData.get("reservationId") as string;
        const customerId = formData.get("customerId") as string;

        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        if (!reservationId) {
            return NextResponse.json(
                { error: "Missing reservationId." },
                { status: 400 }
            );
        }

        if (!customerId) {
            return NextResponse.json(
                { error: "Missing customerId" },
                { status: 400 }
            );
        }

        // TODO: Add validation for file size and type here
        // TODO: Authenticate the request (e.g., check session)

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate a unique filename
        const uniqueId = uuidv4();
        const fileExtension = path.extname(file.name);
        const serverFileName = `${uniqueId}${fileExtension}`;

        // TODO: Define your actual file storage path. Consider cloud storage (S3, etc.) for production.
        // This example saves to a local 'uploads' directory.
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const filePath = path.join(uploadDir, serverFileName);

        await writeFile(filePath, buffer);

        c.i(`File uploaded: ${filePath}`);
        const service = container.get<IMediaService>(TYPES.IMediaService);
        const media = new Media();
        media.reservationId = reservationId;
        media.customerId = customerId;
        media.url = `/uploads/${serverFileName}`;

        await service.createMedia(media, session.user);

        // Return the ID and name to the frontend
        return NextResponse.json({
            id: uniqueId, // The UUID you will send back to the parent
            fileName: serverFileName,
            url: `/uploads/${serverFileName}` // Optional: public URL if needed for thumbnails
        });

    } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    else
      return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}