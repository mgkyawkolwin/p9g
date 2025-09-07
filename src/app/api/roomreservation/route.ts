import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES, SearchParam } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import { searchSchema } from "@/core/validation/zodschema";
import { HttpStatusCode } from "@/core/lib/constants";
import { buildSearchParams } from "@/core/lib/utils";
import IReservationService from "@/core/domain/services/contracts/IReservationService";
import { CustomError } from "@/core/lib/errors";
import ILogService from "@/core/domain/services/contracts/ILogService";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/roomreservation");
    c.d(JSON.stringify(request));
    let searchParams: SearchParam[];

    c.i('Converting url search params into form object.')
    const searchFormData = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchFormData));

    c.i('Validating search form object.');
    const validatedSearchFields = await searchSchema.safeParseAsync(searchFormData);
    if (!validatedSearchFields.success) {
      c.i('Search param validation failed.');
      c.d(validatedSearchFields.error.flatten());
    }
    if (validatedSearchFields.success) {
      c.i('Search param validation successful. Build search params.');
      searchParams = buildSearchParams(validatedSearchFields.data);
      c.d(searchParams);
    }

    //call service to retrieve data
    c.i('Calling reservation service');
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const result = await reservationService.roomReservationGetList(searchParams);
    c.d(JSON.stringify(result));

    return NextResponse.json({ data: result }, { status: HttpStatusCode.Ok });
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


export async function PATCH(request: NextRequest) {
  try {
    c.fs("PATCH /api/roomreservation");
    c.d(JSON.stringify(request));
    //const searchParams : SearchParam[] = [];

    c.i('Converting url search params into form object.');
    const queryStringObject = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(queryStringObject));

    //call service to retrieve data
    c.i('Calling reservation service');
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const result = await reservationService.reservationMoveRoom(queryStringObject.id, queryStringObject.roomNo);
    c.d(JSON.stringify(result));

    return NextResponse.json({ data: result }, { status: HttpStatusCode.Ok });
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