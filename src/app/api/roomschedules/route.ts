import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES, SearchParam } from "@/lib/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { searchValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils";
import IReservationService from "@/core/services/contracts/IReservationService";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/roomsechedules");
    c.d(JSON.stringify(request));

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    c.i('Converting url search params into form object.')
    const searchFormData = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchFormData));

    c.i('Validating search form object.');
    const validatedSearchFields = await searchValidator.safeParseAsync(searchFormData);
    // if (validatedSearchFields.success) {
    //   c.i('Search param validation successful. Build search params.');
    //   searchParams = buildSearchParams(validatedSearchFields.data);
    //   c.d(searchParams);
    // }

    //call service to retrieve data
    c.i('Calling reservation service');
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const result = await reservationService.roomScheduleGetList(validatedSearchFields.data, session.user);
    c.d(JSON.stringify(result));

    c.fe("GET /api/roomsechedules");
    return NextResponse.json({ data: result[0] }, { status: HttpStatusCode.Ok });
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
