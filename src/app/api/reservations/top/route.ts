import { db } from "@/data/orm/drizzle/mysql/db";
import { userTable } from "@/data/orm/drizzle/mysql/schema";
import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/domain/services/contracts/IUserService";
import { TYPES, PagerParams, SearchParam } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { pagerSchema, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, pagerWithDefaults } from "@/lib/utils";
import ICustomerService from "@/domain/services/contracts/ICustomerService";
import IReservationService from "@/domain/services/contracts/IReservationService";


export async function GET(request: NextRequest) {
  try{
    c.i("----------------------------------------------------------");
    c.i("GET /api/reservations/top");
    c.d(JSON.stringify(request));

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //no need to validate pager params, if not valid, will use defaults
    const pagerValidatedFields = await pagerSchema.safeParseAsync(searchParams);
    c.d(JSON.stringify(pagerValidatedFields));
    const pager = pagerWithDefaults(pagerValidatedFields.data);
    c.d(JSON.stringify(pager));

    //call service to retrieve data
    const service = container.get<IReservationService>(TYPES.IReservationService);
    const result = await service.reservationTopList(pager);
    c.d(result?.length);

    return NextResponse.json({data : result}, {status: 200});
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return NextResponse.json(error, { status: HttpStatusCode.ServerError });
  }
}
