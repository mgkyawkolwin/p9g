import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/lib/constants";
import IReservationService from "@/core/domain/services/contracts/IReservationService";
import { CustomError } from "@/core/lib/errors";
import ILogService from "@/core/domain/services/contracts/ILogService";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    c.fs("PATCH /api/reservations/[id]/dropoff");
    c.d(JSON.stringify(request));

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);

    const body = await request.json();

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
    await reservationService.reservationUpdateDropOffInfo(id, body.carNo, body.driver);


    c.i('Return PATCH /api/reservations/[id]/dropoff');
    return NextResponse.json({ status: HttpStatusCode.Ok });
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