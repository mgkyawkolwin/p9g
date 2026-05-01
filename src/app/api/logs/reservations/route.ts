import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { pagerValidator, searchValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import { getPagerWithDefaults } from "@/core/helpers";
import { CustomError } from "@/lib/errors";
import { auth } from "@/app/auth";
import ILogService from "@/core/services/contracts/ILogService";

export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/logs/reservations");
    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);

    const locationHeader = request.headers.get('X-Resort-Location');
    if (!locationHeader)
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = locationHeader;

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const searchValidatedFields = await searchValidator.safeParseAsync(searchParams);
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    const pager = getPagerWithDefaults(pagerValidatedFields.data);

    const logService = container.get<ILogService>(TYPES.ILogService);
    const result = await logService.reservationLogGetList(
      searchValidatedFields.success ? searchValidatedFields.data : {},
      pager,
      locationHeader
    );

    return NextResponse.json({ data: result }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: 'Unknown error occured.' }, { status: HttpStatusCode.ServerError });
  }
}
