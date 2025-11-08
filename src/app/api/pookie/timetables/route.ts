import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { pookieGetValidator, pookieValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IPookieService from "@/core/services/contracts/IPookieService";
import PookieTimeTable from "@/core/models/domain/PookieTimeTable";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/pookie/timetables");
    c.d(JSON.stringify(request));

    const session = await auth();
    if(!session?.user)
        throw new CustomError('Invalid session');

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //validate search params
    const validatedFields = await pookieGetValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(validatedFields));

    //call service to retrieve data
    const customerService = container.get<IPookieService>(TYPES.IPookieService);
    const result = await customerService.getTimeTable(validatedFields.data.drawDate, session.user);

    return NextResponse.json({ data: {timeTable:result} }, { status: HttpStatusCode.Ok });
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


export async function POST(request: NextRequest) {
  try {
    c.fs("POST api/pookie/timetables");
    c.i("Retrieving post body.")
    const body = await request.json();
    c.d(body);

    const session = await auth();
    if(!session?.user)
      throw new CustomError('Invalid session');

    c.i("Validating post data.");
    const validatedData = await pookieValidator.safeParseAsync(body?.timeTable);

    if (!validatedData.success) {
      c.d("Post data is invalid. Return result.");
      c.d(validatedData.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
    }

    // update user
    c.i("Calling service.");
    const pookieService = container.get<IPookieService>(TYPES.IPookieService);
    await pookieService.updatePookie(validatedData.data as unknown as PookieTimeTable, session.user);
    
    c.i("Everything is fine. Return final result.");
    return NextResponse.json({ message: "Timetable updated"}, { status: HttpStatusCode.Created });
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
