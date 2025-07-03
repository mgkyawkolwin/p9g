import { db } from "@/data/orm/drizzle/mysql/db";
import { user } from "@/data/orm/drizzle/mysql/schema";
import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/domain/services/contracts/IUserService";
import { TYPES, PagerParams, SearchParam } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { pagerSchema, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, pagerWithDefaults } from "@/lib/utils";
import ICustomerService from "@/domain/services/contracts/ICustomerService";


export async function GET(request: NextRequest) {
  try{
    c.i("----------------------------------------------------------");
    c.i("GET /api/reservations");
    c.d(JSON.stringify(request));

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //validate search params
    let searchFields : SearchParam[] = [];
    const searchValidatedFields = await searchSchema.safeParseAsync(searchParams);
    c.d(JSON.stringify(searchValidatedFields));
    if(searchValidatedFields.success){
      //validation successful, build search objects
      //convert raw params into searchParam array
      searchFields = buildSearchParams(searchValidatedFields.data);
      c.d(JSON.stringify(searchFields));
    }

    //no need to validate pager params, if not valid, will use defaults
    const pagerValidatedFields = await pagerSchema.safeParseAsync(searchParams);
    c.d(JSON.stringify(pagerValidatedFields));
    const pager = pagerWithDefaults(pagerValidatedFields.data);
    c.d(JSON.stringify(pager));

    //call service to retrieve data
    const customerService = container.get<ICustomerService>(TYPES.ICustomerService);
    const result = await customerService.customerFindMany(searchFields, pager);
    c.d(JSON.stringify(result));

    return NextResponse.json({data : result}, {status: 200});
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return NextResponse.json(error, { status: HttpStatusCode.ServerError });
  }
}
