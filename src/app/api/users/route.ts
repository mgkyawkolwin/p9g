import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import IUserService from "@/core/services/contracts/IUserService";
import { TYPES, SearchParam } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { pagerValidator, searchValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import { getPagerWithDefaults } from "@/core/helpers";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/users");
    c.d(JSON.stringify(request));

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //validate search params
    // let searchFields: SearchParam[] = [];
    const searchValidatedFields = await searchValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(searchValidatedFields));
    // if (searchValidatedFields.success) {
    //   //validation successful, build search objects
    //   //convert raw params into searchParam array
    //   searchFields = buildSearchParams(searchValidatedFields.data);
    //   c.d(JSON.stringify(searchFields));
    // }

    //no need to validate pager params, if not valid, will use defaults
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(pagerValidatedFields));
    const pager = getPagerWithDefaults(pagerValidatedFields.data);
    c.d(JSON.stringify(pager));

    //call service to retrieve data
    const userService = container.get<IUserService>(TYPES.IUserService);
    const result = await userService.userFindMany(searchValidatedFields.data, pager, session.user);
    c.d(JSON.stringify(result));

    return NextResponse.json({ data: result[0] }, { status: HttpStatusCode.Ok });
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



export async function POST(request: Request) {
  try {
    c.fs("POST /api/users");
    c.d(JSON.stringify(request));

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    const body = await request.json();
    const userService = container.get<IUserService>(TYPES.IUserService);
    await userService.userCreate(body, session.user);

    c.fe("POST /api/users");
    return NextResponse.json({ message: "Inserted" }, { status: HttpStatusCode.Ok });
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