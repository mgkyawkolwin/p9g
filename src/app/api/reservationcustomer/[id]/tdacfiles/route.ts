import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { auth } from "@/app/auth";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import IMediaService from "@/core/services/contracts/IMediaService";
import Media from "@/core/models/domain/Media";
import ReservationCustomer from "@/core/models/domain/ReservationCustomer";
import type IRepository from "@/lib/repositories/IRepository";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("POST /api/reservationcustomer/[id]/tdacfiles");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: 'Reservation customer id is required.' }, { status: HttpStatusCode.BadRequest });
    }

    const reservationCustomerRepository = container.get<IRepository<ReservationCustomer>>(TYPES.IReservationCustomerRepository);
    const reservationCustomer = await reservationCustomerRepository.findById(id);
    if (!reservationCustomer) {
      throw new CustomError('Reservation customer not found.', HttpStatusCode.NotFound);
    }

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    if (!files || files.length === 0) {
      throw new CustomError('No files were uploaded.', HttpStatusCode.BadRequest);
    }

    const uploadDir = path.join(process.cwd(), 'tdac');
    await mkdir(uploadDir, { recursive: true });

    const mediaService = container.get<IMediaService>(TYPES.IMediaService);
    const uploadedFiles: Array<{ mediaId: string; fileName: string; url: string }> = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueId = uuidv4();
      const fileExtension = path.extname(file.name);
      const serverFileName = `${uniqueId}${fileExtension}`;
      const filePath = path.join(uploadDir, serverFileName);
      await writeFile(filePath, buffer);

      const media = new Media();
      media.id = uniqueId;
      media.reservationId = reservationCustomer.reservationId;
      media.customerId = reservationCustomer.customerId;
      media.url = `/tdac/${serverFileName}`;

      await mediaService.createMedia(media, session.user, 'TDAC');
      uploadedFiles.push({ mediaId: uniqueId, fileName: file.name, url: media.url });
    }

    c.fe('POST /api/reservationcustomer/[id]/tdacfiles');
    return NextResponse.json({ message: 'TDAC files uploaded successfully.', files: uploadedFiles }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: 'Unknown error occured.' }, { status: HttpStatusCode.ServerError });
  }
}
