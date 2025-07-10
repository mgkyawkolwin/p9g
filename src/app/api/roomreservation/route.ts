import { db } from "@/data/orm/drizzle/mysql/db";
import { userTable } from "@/data/orm/drizzle/mysql/schema";
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


export async function GET(request: NextRequest) {
  try{
    c.i("GET /api/roomreservation");
    c.d(JSON.stringify(request));
    let searchParams : SearchParam[] = [];

    c.i('Converting url search params into form object.')
    const searchFormData = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchFormData));

    c.i('Validating search form object.');
    const validatedSearchFields = await searchSchema.safeParseAsync(searchFormData);
    if(!validatedSearchFields.success){
        c.i('Search param validation failed.');
        c.d(validatedSearchFields.error.flatten());
    }
    if(validatedSearchFields.success){
      c.i('Search param validation successful. Build search params.');
      searchParams = buildSearchParams(validatedSearchFields.data);
      c.d(searchParams);
    }

    //call service to retrieve data
    c.i('Calling reservation service');
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const result = await reservationService.roomReservationList(searchParams);
    c.d(JSON.stringify(result));

    return NextResponse.json({data : result}, {status: 200});
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return NextResponse.json(error, { status: HttpStatusCode.ServerError });
  }
}
