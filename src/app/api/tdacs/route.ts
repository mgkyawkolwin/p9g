// app/api/media/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import c from "@/lib/loggers/console/ConsoleLogger";
import { TYPES } from "@/core/types";
import { container } from "@/core/di/dicontainer";
import { auth } from "@/app/auth";
import { CustomError } from "@/lib/errors";
import { HttpStatusCode } from "@/core/constants";
import ILogService from "@/core/services/contracts/ILogService";
import ICustomerService from "@/core/services/contracts/ICustomerService";


export async function PATCH(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const reservationId = formData.get("reservationId") as string;
        const customerId = formData.get("customerId") as string;

        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { message: "No file uploaded" },
                { status: 400 }
            );
        }

        if (!reservationId) {
            return NextResponse.json(
                { message: "Missing reservationId." },
                { status: 400 }
            );
        }

        if (!customerId) {
            return NextResponse.json(
                { message: "Missing customerId" },
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
        const uploadDir = path.join(process.cwd(), "public", "tdacs");
        const filePath = path.join(uploadDir, serverFileName);

        await writeFile(filePath, buffer);

        c.i(`File uploaded: ${filePath}`);
        const service = container.get<ICustomerService>(TYPES.ICustomerService);
        const url = `/tdacs/${serverFileName}`;

        await service.customerUpdateTdac(reservationId, customerId, url, session.user);

        // Return the ID and name to the frontend
        return NextResponse.json({
            message: "TDAC file uploaded.",
            id: uniqueId, // The UUID you will send back to the parent
            fileName: serverFileName,
            url: `/tdacs/${serverFileName}` // Optional: public URL if needed for thumbnails
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


export async function DELETE(request: NextRequest) {
  try {
    c.fs("DELETE api/tdacs");

    const { reservationId, customerId, tdacFileUrl } = Object.fromEntries(request.nextUrl.searchParams);

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    if (!reservationId) {
      c.d("Invalid ID param. Return result.");
      return NextResponse.json({ message: "Invalid reservation ID. Delete failed." }, { status: HttpStatusCode.BadRequest });
    }

    if (!customerId) {
      c.d("Invalid customer ID. Return result.");
      return NextResponse.json({ message: "Invalid customer ID. Delete failed." }, { status: HttpStatusCode.BadRequest });
    }

    if (!tdacFileUrl) {
      c.d("Invalid file param. Return result.");
      return NextResponse.json({ message: "Invalid file url. Delete failed." }, { status: HttpStatusCode.BadRequest });
    }

    const fileDir = path.join(process.cwd(), "public");
    const filePath = path.join(fileDir, tdacFileUrl);


    await unlink(filePath);

    // update user
    c.i("Calling service.");
    const service = container.get<ICustomerService>(TYPES.ICustomerService);
    await service.customerDeleteTdac(reservationId, customerId, session.user);

    c.fe("DELETE api/tdacs");
    return NextResponse.json({ message: "Deleted" }, { status: HttpStatusCode.Ok });
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