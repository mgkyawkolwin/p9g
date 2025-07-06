import { db } from "@/data/orm/drizzle/mysql/db";
import { ReservationEntity, userTable } from "@/data/orm/drizzle/mysql/schema";
import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/domain/services/contracts/IUserService";
import { TYPES, PagerParams, SearchParam } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { pagerSchema, reservationValidator, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, pagerWithDefaults } from "@/lib/utils";
import ICustomerService from "@/domain/services/contracts/ICustomerService";
import IReservationService from "@/domain/services/contracts/IReservationService";
import Reservation from "@/domain/models/Reservation";


export async function POST(request: NextRequest) {
    try{
        c.i("POST api/reservations/create");
        c.i("Retrieving post body.")
        const body = await request.json();
        c.d(body);

        c.i("Validating post data.");
        const validatedReservation = await reservationValidator.safeParseAsync(body);
        
        if(!validatedReservation.success){
            c.d("Reservation data is invalid. Return result.");
            c.d(validatedReservation.error.flatten());
            return NextResponse.json({ message: "Create failed." }, { status: HttpStatusCode.BadRequest });
        }

        // update user
        c.i("Calling service.");
        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        const createdReservation = await reservationService.createReservation(validatedReservation.data as any);
        if(!createdReservation){
            c.d("Reservaton creation failed. Return result.");
            return NextResponse.json({ message: "Create failed." }, { status: HttpStatusCode.ServerError });
        }

        c.i("Everything is fine. Return final result.");
        return NextResponse.json({ message: "Created", data: createdReservation }, { status: HttpStatusCode.Created });
    }catch(error){
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
    }
}
