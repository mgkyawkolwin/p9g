import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES } from "@/lib/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/lib/constants";
import IReservationService from "@/core/services/contracts/IReservationService";
import { billValidator } from "@/core/validators/zodschema";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("GET /api/reservations/[id]/bills");
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
        const result = await reservationService.billGetListById(id, session.user);

        c.i('Return GET /api/reservations/[id]/bills');
        return NextResponse.json({data:{ bills: result[0] }}, { status: HttpStatusCode.Ok });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        if (error instanceof CustomError)
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        else
            return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
    }
}


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("POST /api/reservations/[id]/bills");
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

        const requestBody = await request.json();
        if (!requestBody) {
            c.i('No data. Return invalid response.');
            return NextResponse.json({ message: "No data." }, { status: HttpStatusCode.BadRequest });
        }
        c.d(requestBody);

        const bills = [];

        requestBody.map((bill) => {
            const result = billValidator.safeParse(bill);
            if (result.success)
                bills.push(result.data);
        });

        if (bills.length <= 0) {
            c.i('No bills. Return invalid response.');
            return NextResponse.json({ message: "No bill to update." }, { status: HttpStatusCode.BadRequest });
        }
        //call service to retrieve data
        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        await reservationService.billUpdateList(id, bills, session.user);


        c.i('Return POST /api/reservations/[id]/bills');
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