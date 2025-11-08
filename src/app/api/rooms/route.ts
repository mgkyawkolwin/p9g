import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IRoomService from "@/core/services/contracts/IRoomService";


export async function GET(request: NextRequest) {
  try {
    c.fs("POST api/rooms");

    const session = await auth();
    if(!session?.user)
      throw new CustomError('Invalid session');

    // update user
    c.i("Calling service.");
    const roomService = container.get<IRoomService>(TYPES.IRoomService);
    const rooms = await roomService.getRooms(session.user);

    c.fe("GET /api/rooms");
    return NextResponse.json({ message: undefined, data: {rooms:rooms} }, { status: HttpStatusCode.Ok });
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
