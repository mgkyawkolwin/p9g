import { db } from "@/data/orm/drizzle/mysql/db";
import { user } from "@/data/orm/drizzle/mysql/schema";
import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/services/contracts/IUserService";
import { TYPES, PagerParams, SearchParam } from "@/lib/types";
import consoleLogger from "@/lib/core/logger/ConsoleLogger";
import { pagerSchema, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, pagerWithDefaults } from "@/lib/utils";


export async function GET(request: NextRequest) {
  try{
    consoleLogger.logInfo("GET /api/users");
    consoleLogger.logDebug(JSON.stringify(request));

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    consoleLogger.logDebug(JSON.stringify(searchParams));

    //validate search params
    let searchFields : SearchParam[] = [];
    const searchValidatedFields = await searchSchema.safeParseAsync(searchParams);
    consoleLogger.logDebug(JSON.stringify(searchValidatedFields));
    if(searchValidatedFields.success){
      //validation successful, build search objects
      //convert raw params into searchParam array
      searchFields = buildSearchParams(searchValidatedFields.data);
      consoleLogger.logDebug(JSON.stringify(searchFields));
    }

    //no need to validate pager params, if not valid, will use defaults
    const pagerValidatedFields = await pagerSchema.safeParseAsync(searchParams);
    consoleLogger.logDebug(JSON.stringify(pagerValidatedFields));
    const pager = pagerWithDefaults(pagerValidatedFields.data);
    consoleLogger.logDebug(JSON.stringify(pager));

    //call service to retrieve data
    const userService = container.get<IUserService>(TYPES.IUserServce);
    const result = await userService.userFindMany(searchFields, pager);
    consoleLogger.logDebug(JSON.stringify(result));

    return NextResponse.json({data : result}, {status: 200});
  }catch(error){
    consoleLogger.logError(error instanceof Error ? error.message : String(error));
    return NextResponse.json(error, { status: HttpStatusCode.ServerError });
  }
}



export async function POST(request: Request) {
  try{
    consoleLogger.logInfo("GET /api/users/[id]");
    consoleLogger.logDebug(JSON.stringify(request));
    const body = await request.json();
    const userService = container.get<IUserService>(TYPES.IUserServce);
    const selected = await userService.userCreate(body);
    return NextResponse.json({ message: "Inserted"}, { status: 201 });
  }catch(error){
    consoleLogger.logError(error instanceof Error ? error.message : String(error));
    return NextResponse.json({ message: "Unknown error occured."}, { status: 500 });
  }
}