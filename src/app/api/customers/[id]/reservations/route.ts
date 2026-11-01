import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { container } from "@/core/di/dicontainer";
import { HttpStatusCode } from "@/core/constants";
import { TYPES } from "@/core/types";
import IReservationService from "@/core/services/contracts/IReservationService";
import ILogService from "@/core/services/contracts/ILogService";
import { CustomError } from "@/lib/errors";
import c from "@/lib/loggers/console/ConsoleLogger";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        c.fs("GET /api/customers/[id]/reservations");
        const session = await auth();
        if (!session?.user)
            throw new CustomError("Invalid session");

        const location = request.headers.get("X-Resort-Location");
        if (!location)
            throw new CustomError("Location header is required", HttpStatusCode.BadRequest);
        session.user.location = location;

        const { id } = await context.params;
        if (!id)
            throw new CustomError("Customer id is required", HttpStatusCode.BadRequest);

        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        const reservations = await reservationService.reservationGetListByCustomerId(id, session.user);
        return NextResponse.json({ data: { reservations } }, { status: HttpStatusCode.Ok });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        const logService = container.get<ILogService>(TYPES.ILogService);
        await logService.logError(error);
        if (error instanceof CustomError)
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        return NextResponse.json({ message: "Unable to load reservation history." }, { status: HttpStatusCode.ServerError });
    }
}