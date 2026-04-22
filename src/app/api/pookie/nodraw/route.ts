import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { pookieGetValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IPookieService from "@/core/services/contracts/IPookieService";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/pookie/nodraw");

    const session = await auth();
    if(!session?.user)
      throw new CustomError('Invalid session');

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;
    c.d(session.user);

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(searchParams);

    const validatedData = await pookieGetValidator.safeParseAsync(searchParams);
    if (!validatedData.success) {
      c.d("Data is invalid. Return result.");
      c.d(validatedData.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
    }

    const service = container.get<IPookieService>(TYPES.IPookieService);
    const rooms = await service.getNoDraw(validatedData.data.drawDate, session.user);

    c.fe("GET /api/pookie/nodraw");
    return NextResponse.json({ message: undefined, data: { rooms: rooms } }, { status: HttpStatusCode.Ok });
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
