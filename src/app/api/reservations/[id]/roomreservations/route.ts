import { NextResponse, NextRequest } from "next/server";

import { container } from "@/dicontainer";
import { TYPES } from "@/core/lib/types";
import c from "@/core/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/lib/constants";
import IReservationService from "@/core/domain/services/contracts/IReservationService";
import { CustomError } from "@/core/lib/errors";
import ILogService from "@/core/domain/services/contracts/ILogService";
import { roomChargeValidator, roomReservationValidator } from "@/core/validators/zodschema";
import RoomCharge from "@/core/domain/models/RoomCharge";
import RoomReservation from "@/core/domain/models/RoomReservation";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("GET /api/reservations/[id]/roomreservations");
        c.d(JSON.stringify(request));

        const p = await params;
        c.d(p);
        const { id } = p;

        if (!id) {
            c.i('No reservationId. Return invalid response.');
            return NextResponse.json({ status: HttpStatusCode.BadRequest });
        }

        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        const result = await reservationService.roomReservationGetListById(id, true);

        c.i('Return GET /api/reservations/[id]/roomreservations');
        return NextResponse.json({ roomReservations: result }, { status: HttpStatusCode.Ok });
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
    c.fs("PUT api/reservations/{id}/roomreservations");
    c.i("Retrieving put body.")
    const p = await params;
    c.d(p);
    const { id } = p;
    const body = await request.json();
    c.d(body);
    const roomReservations = body as unknown as RoomReservation[];
    const validatedRoomReservations : RoomReservation[] = [];

    if(Array.isArray(body) && body.length === 0) {
      c.i("No data to process. Return bad request.");
      return NextResponse.json({ message: "No data to process." }, { status: HttpStatusCode.BadRequest });
    }

    c.i("Validating input data.");
    roomReservations.forEach((roomReservation:RoomReservation) => {
        const parsedRoomReservation = roomReservationValidator.safeParse(roomReservation);
  
        //form validation fail
        if (!parsedRoomReservation.success) {
            throw new CustomError('Invalid room reservation inputs.', HttpStatusCode.BadRequest);
        }

        const validatedRoomReservation = parsedRoomReservation.data as unknown as RoomReservation;
        validatedRoomReservation.roomCharges = [];
        validatedRoomReservations.push(validatedRoomReservation);

        roomReservation.roomCharges?.forEach( (roomCharge:RoomCharge) => {
            const parsedRoomCharge = roomChargeValidator.safeParse(roomCharge);
            
            if (!parsedRoomCharge.success) {
                throw new CustomError('Invalid room charge inputs.', HttpStatusCode.BadRequest);
            }
            validatedRoomReservation.roomCharges.push(parsedRoomCharge.data as unknown as RoomCharge);
        });
    });

    c.i("Input data validated.");
    c.d(validatedRoomReservations);

    // update user
    c.i("Calling service.");
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const createdReservation = await reservationService.roomReservationUpdateList(id, validatedRoomReservations);
    if (!createdReservation) {
      c.d("Reservaton creation failed. Return result.");
      return NextResponse.json({ message: "Create failed." }, { status: HttpStatusCode.ServerError });
    }

    c.i("Everything is fine. Return final result.");
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