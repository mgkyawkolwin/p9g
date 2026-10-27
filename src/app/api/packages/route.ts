import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { getPagerWithDefaults } from "@/core/helpers";
import { pagerValidator, prepaidPackageValidator, searchValidator } from "@/core/validators/zodschema";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IPrepaidPackageService from "@/core/services/contracts/IPrepaidPackageService";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/packages");

    const session = await auth();
    if (!session?.user) throw new CustomError('Invalid session');

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    const searchValidatedFields = await searchValidator.safeParseAsync(searchParams);
    const pager = getPagerWithDefaults(pagerValidatedFields.data);

    const service = container.get<IPrepaidPackageService>(TYPES.IPrepaidPackageService);
    const result = await service.prepaidPackageFindMany(pager, session.user, searchValidatedFields.data);

    pager.records = result[1];
    pager.pages = Math.ceil(pager.records / pager.pageSize);
    return NextResponse.json({ data: { packages: result[0], pager: { ...pager, records: result[1] } } }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}


export async function POST(request: NextRequest) {
  try {
    c.fs("POST /api/packages");

    const body = await request.json();
    c.d(body);

    const session = await auth();
    if (!session?.user) throw new CustomError('Invalid session');

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;

    const validatedFields = await prepaidPackageValidator.safeParseAsync(body);
    if (!validatedFields.success) {
      c.d(validatedFields.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
    }

    const service = container.get<IPrepaidPackageService>(TYPES.IPrepaidPackageService);
    const created = await service.prepaidPackageCreate(validatedFields.data as unknown as PrepaidPackage, session.user);

    return NextResponse.json({ message: "Created", data: created }, { status: HttpStatusCode.Created });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}