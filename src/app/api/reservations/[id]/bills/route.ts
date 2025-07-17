import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { HttpStatusCode } from "@/lib/constants";
import IReservationService from "@/domain/services/contracts/IReservationService";
import Bill from "@/domain/models/Bill";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.i("PATCH /api/reservations/[id]/bills");
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
        const result = await reservationService.billsGet(id);

        c.i('Return GET /api/reservations/[id]/bills');
        return NextResponse.json({bills:result}, { status: HttpStatusCode.Ok });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json(error, { status: HttpStatusCode.ServerError });
    }
}


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.i("POST /api/reservations/[id]/bills");
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

        const bills = requestBody.map(bill => (
            {...bill, 
                dateUTC: new Date(bill.dateUTC), 
                paidOnUTC: bill.paidOnUTC ? new Date(bill.paidOnUTC) : undefined
            }
        ));
        //call service to retrieve data
        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        await reservationService.billsSave(id, bills);


        c.i('Return POST /api/reservations/[id]/bills');
        return NextResponse.json({ status: HttpStatusCode.Ok });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json(error, { status: HttpStatusCode.ServerError });
    }
}