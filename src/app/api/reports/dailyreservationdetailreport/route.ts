import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import IReportService from "@/core/services/contracts/IReportService";
import { auth } from "@/app/auth";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/reports/dailyreservationdetailreport");
    c.d(JSON.stringify(request));

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    if(!searchParams.checkInFrom && !searchParams.checkInUntil && !searchParams.createdFrom && !searchParams.createdUntil && !searchParams.updatedFrom && !searchParams.updatedUntil)
      throw new CustomError('Date range is required');

    //call service to retrieve data
    const reportService = container.get<IReportService>(TYPES.IReportService);
    const result = await reportService.getDailyReservationDetailReport(searchParams.checkInFrom, searchParams.checkInUntil, searchParams.createdFrom, searchParams.createdUntil, searchParams.updatedFrom, searchParams.updatedUntil, searchParams.reservationType, searchParams.reservationStatus, searchParams.bookingSource, session.user);
    //c.d(JSON.stringify(result));

    return NextResponse.json({ data: result }, { status: HttpStatusCode.Ok });
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
