import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { HttpStatusCode } from "@/lib/constants";
import IReservationService from "@/domain/services/contracts/IReservationService";
import Bill from "@/domain/models/Bill";
import { billValidator, paymentValidator } from "@/lib/zodschema";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.i("GET /api/reservations/[id]/payments");
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
        const result = await reservationService.paymentsGet(id);

        c.i('Return GET /api/reservations/[id]/payments');
        return NextResponse.json({payments:result}, { status: HttpStatusCode.Ok });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json(error, { status: HttpStatusCode.ServerError });
    }
}


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.i("POST /api/reservations/[id]/payments");
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

        let payments = [];

        requestBody.map((payment) => {
            const result =  paymentValidator.safeParse(payment);
            if(result.success)
                payments.push(result.data);
        });
        c.i('Validated payment');
        c.d(payments);
        //call service to retrieve data
        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        await reservationService.paymentsSave(id, payments);


        c.i('Return POST /api/reservations/[id]/payments');
        return NextResponse.json({ status: HttpStatusCode.Ok });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json(error, { status: HttpStatusCode.ServerError });
    }
}