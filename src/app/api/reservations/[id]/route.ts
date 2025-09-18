import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { reservationValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import IReservationService from "@/core/services/contracts/IReservationService";
import Reservation from "@/core/models/domain/Reservation";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    c.fs("GET /api/reservations/[id]/roomreservations");
    c.d(JSON.stringify(request));

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    //retrieve search params from request
    const p = await params;
    c.d(p);
    const { id } = p;

    if (!id) {
      c.i('No reservationId. Return invalid response.');
      return NextResponse.json({ status: HttpStatusCode.BadRequest });
    }

    //call service to retrieve data
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const result = await reservationService.reservationGetById(id, session.user);
    c.d(JSON.stringify(result));

    c.fe('GET /api/reservations/[id]');
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


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    c.fs("PUT api/reservations/[id]/roomreservations");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    const body = await request.json();
    c.d(body);

    const { id } = await params;

    c.i("Validating post data.");
    const validatedReservation = await reservationValidator.safeParseAsync(body);

    if (!validatedReservation.success) {
      c.d("Reservation data is invalid. Return result.");
      c.d(validatedReservation.error.flatten());
      return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.BadRequest });
    }

    // update user
    c.i("Calling service.");
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    await reservationService.reservationUpdate(id, validatedReservation.data as unknown as Reservation, session.user);

    c.fe("PUT api/reservations/[id]/roomreservations");
    return NextResponse.json({ message: "Updated" }, { status: HttpStatusCode.Ok });
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