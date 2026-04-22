import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import IReservationService from "@/core/services/contracts/IReservationService";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";


export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string, paymentId: string }> }) {
    try {
        c.fs("DELETE /api/reservations/[id]/payments/[paymentId]");
        c.d(JSON.stringify(request));

        const session = await auth();
        if (!session?.user)
            throw new CustomError('Invalid session');

        if (!request.headers.get('X-Resort-Location'))
            throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
        session.user.location = request.headers.get('X-Resort-Location') || undefined;
        c.d(session.user);

        //retrieve search params from request
        const p = await context.params;
        c.d(p);
        const { id, paymentId } = p;

        if (!id) {
            c.i('No reservationId. Return invalid response.');
            return NextResponse.json({ status: HttpStatusCode.BadRequest });
        }

        if (!paymentId) {
            c.i('No payment id. Return invalid response.');
            return NextResponse.json({ status: HttpStatusCode.BadRequest });
        }

        //call service to retrieve data
        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        await reservationService.paymentDeleteById(id, paymentId, session.user);

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