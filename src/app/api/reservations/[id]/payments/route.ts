import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/lib/constants";
import IReservationService from "@/core/domain/services/contracts/IReservationService";
import Bill from "@/core/domain/models/Bill";
import { billValidator, paymentValidator } from "@/core/validation/zodschema";
import { CustomError } from "@/core/lib/errors";
import ILogService from "@/core/domain/services/contracts/ILogService";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("GET /api/reservations/[id]/payments");
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
        const result = await reservationService.paymentGetListById(id);

        c.i('Return GET /api/reservations/[id]/payments');
        return NextResponse.json({ payments: result }, { status: HttpStatusCode.Ok });
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


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("POST /api/reservations/[id]/payments");
        c.d(JSON.stringify(request));


        //retrieve search params from request
        const p = await params;
        c.d(p);
        const { id } = p;

        if (!id) {
            c.i('No reservationId. Return invalid response.');
            return NextResponse.json({ status: HttpStatusCode.BadRequest });
        }

        const requestBody = await request.json();
        if (!requestBody) {
            c.i('No data. Return invalid response.');
            return NextResponse.json({ status: HttpStatusCode.BadRequest });
        }
        c.d(requestBody);

        const payments = [];

        requestBody.map((payment) => {
            const result = paymentValidator.safeParse(payment);
            if (result.success)
                payments.push(result.data);
        });
        c.i('Validated payment');
        c.d(payments);
        //call service to retrieve data
        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        await reservationService.paymentUpdateList(id, payments);


        c.i('Return POST /api/reservations/[id]/payments');
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