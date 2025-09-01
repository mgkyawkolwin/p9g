import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { reservationValidator } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import IReservationService from "@/domain/services/contracts/IReservationService";
import Reservation from "@/domain/models/Reservation";
import { CustomError } from "@/lib/errors";
import ILogService from "@/domain/services/contracts/ILogService";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    c.i("GET /api/reservations/[id]");
    c.d(JSON.stringify(request));


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
    const result = await reservationService.reservationGetById(id);
    c.d(JSON.stringify(result));

    c.i('Return GET /api/reservations/[id]');
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
    c.i("POST api/reservations/[id]/update");
    c.i("Retrieving post body.")
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
    const createdReservation = await reservationService.reservationUpdate(id, validatedReservation.data as unknown as Reservation);
    if (!createdReservation) {
      c.d("Reservaton creation failed. Return result.");
      return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.ServerError });
    }

    c.i("Everything is fine. Return final result.");
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