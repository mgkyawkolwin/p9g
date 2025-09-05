import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES, SearchParam } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { customerValidator, pagerValidator, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, getPagerWithDefaults } from "@/lib/utils";
import ICustomerService from "@/domain/services/contracts/ICustomerService";
import Customer from "@/domain/models/Customer";
import { CustomError } from "@/lib/errors";
import ILogService from "@/domain/services/contracts/ILogService";
import IReportService from "@/domain/services/contracts/IReportService";


export async function GET(request: NextRequest) {
  try {
    c.i("GET /api/reports/dailysummaryreport");
    c.d(JSON.stringify(request));

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //call service to retrieve data
    const reportService = container.get<IReportService>(TYPES.IReportService);
    const result = await reportService.getDailySummaryGuestsRoomsReport(searchParams.startDate, searchParams.endDate);
    c.d(JSON.stringify(result));

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
