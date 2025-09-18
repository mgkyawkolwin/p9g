import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES } from "@/lib/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/lib/constants";
import IReservationService from "@/core/services/contracts/IReservationService";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, paymentId: string }> }) {
    try {
        c.fs("DELETE /api/reservations/[id]/payments/[paymentId]");
        c.d(JSON.stringify(request));

        const session = await auth();
        if (!session?.user)
            throw new CustomError('Invalid session');

        //retrieve search params from request
        const p = await params;
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