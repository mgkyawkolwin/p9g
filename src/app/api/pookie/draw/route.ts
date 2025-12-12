import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { pookieDrawValidator, pookieGenerateValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IPookieService from "@/core/services/contracts/IPookieService";


export async function GET(request: NextRequest) {
  try {
    c.fs("POST api/pookies/draw");

    const session = await auth();
    if(!session?.user)
      throw new CustomError('Invalid session');

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    c.i("Validating post data.");
    const validatedData = await pookieDrawValidator.safeParseAsync(searchParams);

    if (!validatedData.success) {
      c.d("Draw data is invalid. Return result.");
      c.d(validatedData.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
    }

    // update user
    c.i("Calling service.");
    const pookieService = container.get<IPookieService>(TYPES.IPookieService);
    const timetable = await pookieService.draw(validatedData.data.drawDate, validatedData.data.rooms, validatedData.data.noOfPeople, session.user);
    if (!timetable) {
      c.d("Draw failed. Return result.");
      return NextResponse.json({ message: "Draw failed." }, { status: HttpStatusCode.ServerError });
    }

    c.fe("GET /api/pookie/draw");
    return NextResponse.json({ message: "Draw success.", data: {timeTable:timetable} }, { status: HttpStatusCode.Created });
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
