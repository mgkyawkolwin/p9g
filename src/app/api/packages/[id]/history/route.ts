import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { getPagerWithDefaults } from "@/core/helpers";
import { pagerValidator } from "@/core/validators/zodschema";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IPrepaidPackageService from "@/core/services/contracts/IPrepaidPackageService";


export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("GET /api/packages/[id]/history");

    const session = await auth();
    if (!session?.user) throw new CustomError('Invalid session');

    const location = request.headers.get('X-Resort-Location');
    if (!location)
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = location;

    const { id } = await context.params;
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    const pager = getPagerWithDefaults(pagerValidatedFields.data);

    const service = container.get<IPrepaidPackageService>(TYPES.IPrepaidPackageService);
    const result = await service.prepaidPackageUsageFindMany(id, pager, session.user);

    pager.records = result[1];
    pager.pages = Math.ceil(pager.records / pager.pageSize);
    return NextResponse.json({ data: { usages: result[0], pager } }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}