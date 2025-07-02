import { db } from "@/data/orm/drizzle/mysql/db";
import { user } from "@/data/orm/drizzle/mysql/schema";
import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/services/contracts/IUserService";
import { TYPES, PagerParams, SearchParam } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { pagerSchema, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, pagerWithDefaults } from "@/lib/utils";
import ICustomerService from "@/services/contracts/ICustomerService";
import IReservationService from "@/services/contracts/IReservationService";


export async function POST(request: NextRequest) {
    try{
        c.i("POST api/reservations/create");
        c.i("Retrieving post body.")
        const body = await request.json();
        c.d(body);

        // update user
        const updatedUser = await service.customerUpdate(id, body);
        if(!updatedUser){
            return NextResponse.json({ message: "Update failed." }, { status: 404 });
        }
        return NextResponse.json({ message: "Updated" }, { status: 201 });
    }catch(error){
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json({ message: "Unknow error occured." }, { status: 500 });
    }
}
