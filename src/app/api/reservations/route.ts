import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES, SearchParam } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { pagerValidator, reservationValidator, searchValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import { getPagerWithDefaults } from "@/core/helpers";
import IReservationService from "@/core/services/contracts/IReservationService";
import Reservation from "@/core/models/domain/Reservation";
import { CustomError } from "@/lib/errors";
import { auth } from "@/app/auth";
import ILogService from "@/core/services/contracts/ILogService";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/reservations");
    c.d(JSON.stringify(request));

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //validate search params
    // let searchFields: SearchParam[] = [];
    const searchValidatedFields = await searchValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(searchValidatedFields));
    // if (searchValidatedFields.success) {
    //   c.i('Search param is valid. Building search fields.');
    //   searchFields = buildSearchParams(searchValidatedFields.data);
    //   c.d(JSON.stringify(searchFields));
    // }

    //no need to validate pager params, if not valid, will use defaults
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(pagerValidatedFields));
    const pager = getPagerWithDefaults(pagerValidatedFields.data);
    c.d(JSON.stringify(pager));

    //call service to retrieve data
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const result = await reservationService.reservationGetList(searchValidatedFields.data, pager, searchParams.list, session.user);
    //c.d(JSON.stringify(result));
    pager.records = result[1];
    pager.pages = Math.ceil(pager.records / pager.pageSize);

    c.fe("GET /api/reservations");
    return NextResponse.json({ data: {reservations:result[0], pager:pager} }, { status: 200 });
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


export async function POST(request: NextRequest) {
  try {
    c.fs("POST api/reservations");
    c.i("Retrieving post body.")
    const body = await request.json();
    c.d(body);

    const session = await auth();
    c.d(session ? session.user : null)

    c.i("Validating post data.");
    const validatedReservation = await reservationValidator.safeParseAsync(body);

    if (!validatedReservation.success) {
      c.d("Reservation data is invalid. Return result.");
      c.d(validatedReservation.error.flatten());
      return NextResponse.json({ message: "Create failed." }, { status: HttpStatusCode.BadRequest });
    }

    // update user
    c.i("Calling service.");
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const createdReservation = await reservationService.reservationCreate(validatedReservation.data as unknown as Reservation, session.user);
    if (!createdReservation) {
      c.d("Reservaton creation failed. Return result.");
      return NextResponse.json({ message: "Create failed." }, { status: HttpStatusCode.ServerError });
    }

    c.fe("POST api/reservations");
    return NextResponse.json({ message: "Created", data: createdReservation }, { status: HttpStatusCode.Created });
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
