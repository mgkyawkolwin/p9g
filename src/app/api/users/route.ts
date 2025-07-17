import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/domain/services/contracts/IUserService";
import { TYPES, SearchParam } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { pagerSchema, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, pagerWithDefaults } from "@/lib/utils";


export async function GET(request: NextRequest) {
  try{
    c.i("GET /api/users");
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
    const userService = container.get<IUserService>(TYPES.IUserService);
    const result = await userService.userFindMany(searchFields, pager);
    c.d(JSON.stringify(result));

    return NextResponse.json({data : result}, {status: 200});
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return NextResponse.json(error, { status: HttpStatusCode.ServerError });
  }
}



export async function POST(request: Request) {
  try{
    c.i("GET /api/users/[id]");
    c.d(JSON.stringify(request));
    const body = await request.json();
    const userService = container.get<IUserService>(TYPES.IUserService);
    await userService.userCreate(body);
    return NextResponse.json({ message: "Inserted"}, { status: 201 });
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return NextResponse.json({ message: "Unknown error occured."}, { status: 500 });
  }
}