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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function getSessionUser(request: NextRequest) {
  const session = await auth();
  if (!session?.user)
    throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);
  if (!request.headers.get('X-Resort-Location'))
    throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
  session.user.location = request.headers.get('X-Resort-Location') || undefined;
  return session.user;
}

function errorResponse(error: unknown) {
  if (error instanceof CustomError)
    return NextResponse.json({ message: error.message }, { status: error.statusCode });
  return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("GET /api/customers/[id]/files");
    await getSessionUser(request);
    const { id } = await context.params;
    const service = container.get<IMediaService>(TYPES.IMediaService);
    const medias = await service.findMediasByCustomerId(id);
    return NextResponse.json({ data: medias.map(m => ({ id: m.id, url: m.url })) }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("POST /api/customers/[id]/files");
    const sessionUser = await getSessionUser(request);
    const { id } = await context.params;

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File))
      throw new CustomError('No file was uploaded.', HttpStatusCode.BadRequest);
    if (file.size > MAX_FILE_SIZE)
      throw new CustomError('File size must not exceed 10MB.', HttpStatusCode.BadRequest);

    const uniqueId = uuidv4();
    const extension = path.extname(file.name).replace(/[^.a-zA-Z0-9]/g, '');
    const serverFileName = `${uniqueId}${extension}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, serverFileName), Buffer.from(await file.arrayBuffer()));

    const media = new Media();
    media.id = uniqueId;
    media.customerId = id;
    media.url = `/uploads/${serverFileName}`;

    const service = container.get<IMediaService>(TYPES.IMediaService);
    await service.createCustomerMedia(media, sessionUser);

    return NextResponse.json({ id: uniqueId, url: media.url }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    return errorResponse(error);
  }
}
