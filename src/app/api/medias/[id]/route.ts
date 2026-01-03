// app/api/media/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import c from "@/lib/loggers/console/ConsoleLogger";
import IMediaService from "@/core/services/contracts/IMediaService";
import { TYPES } from "@/core/types";
import { container } from "@/core/di/dicontainer";
import { auth } from "@/app/auth";
import { CustomError } from "@/lib/errors";
import { HttpStatusCode } from "@/core/constants";
import ILogService from "@/core/services/contracts/ILogService";


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    c.fs("DELETE api/medias");

    const { id } = await params;

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    if (!id) {
      c.d("Invalid ID param. Return result.");
      return NextResponse.json({ message: "Delete failed." }, { status: HttpStatusCode.BadRequest });
    }

    // update user
    c.i("Calling service.");
    const mediaService = container.get<IMediaService>(TYPES.IMediaService);
    await mediaService.deleteMedia(id, session.user);

    c.fe("DELETE api/medias");
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