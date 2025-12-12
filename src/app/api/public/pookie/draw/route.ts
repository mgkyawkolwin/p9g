import { HttpStatusCode } from "@/core/constants";
import { container } from "@/core/di/dicontainer";
import ILogService from "@/core/services/contracts/ILogService";
import IPookieService from "@/core/services/contracts/IPookieService";
import { TYPES } from "@/core/types";
import { pookieDrawValidator } from "@/core/validators/zodschema";
import { CustomError } from "@/lib/errors";
import c from "@/lib/loggers/console/ConsoleLogger";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    c.fs("POST api/pookies/draw");


    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    const session = { user: { location: searchParams.location, id: "00000000-0000-0000-0000-000000000000" } }

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
    return NextResponse.json(
      { message: "Draw success.", data: { timeTable: timetable } },
      {
        status: HttpStatusCode.Created,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
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


// Handle OPTIONS method for preflight requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
