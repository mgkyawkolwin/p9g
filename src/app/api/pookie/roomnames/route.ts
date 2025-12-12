import { auth } from "@/app/auth";
import { HttpStatusCode } from "@/core/constants";
import { container } from "@/core/di/dicontainer";
import ILogService from "@/core/services/contracts/ILogService";
import IPookieService from "@/core/services/contracts/IPookieService";
import { TYPES } from "@/core/types";
import { pookieGetRoomValidator } from "@/core/validators/zodschema";
import { CustomError } from "@/lib/errors";
import c from "@/lib/loggers/console/ConsoleLogger";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    c.fs("POST api/pookie/roomnames");

    const session = await auth();
    if(!session?.user)
      throw new CustomError('Invalid session');

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(searchParams);
    
    const validatedData = await pookieGetRoomValidator.safeParseAsync(searchParams);
    if (!validatedData.success) {
        c.d("Data is invalid. Return result.");
        c.d(validatedData.error.flatten().fieldErrors);
        return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
    }

    // update user
    c.i("Calling service.");
    const service = container.get<IPookieService>(TYPES.IPookieService);
    const roomNames = await service.getRoomNames(validatedData.data.drawDate, validatedData.data.list, session.user);

    c.fe("GET /api/pookie/roomnames");
    return NextResponse.json(
      { message: undefined, data: {roomNames:roomNames} }, 
      { status: HttpStatusCode.Ok},
      );
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