import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/core/di/dicontainer';
import { TYPES } from '@/core/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import { HttpStatusCode } from '@/core/constants';
import { CustomError } from '@/lib/errors';
import ILogService from '@/core/services/contracts/ILogService';
import IReportService from '@/core/services/contracts/IReportService';
import { auth } from '@/app/auth';
import { getISODateTimeString, getISODateTimeMidNightString } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    c.fs('GET /api/reports/pickupdropoffreportnew');

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.BadRequest);

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const defaultStartDateTime = getISODateTimeString(currentDate);
    const defaultMidnightDateTime = getISODateTimeMidNightString(currentDate);

    const arrivalStartDateTime = (searchParams.arrivalStartDateTime as string) || defaultStartDateTime;
    const arrivalEndDateTime = (searchParams.arrivalEndDateTime as string) || defaultMidnightDateTime;
    const departureStartDateTime = (searchParams.departureStartDateTime as string) || defaultStartDateTime;
    const departureEndDateTime = (searchParams.departureEndDateTime as string) || defaultMidnightDateTime;

    const reportService = container.get<IReportService>(TYPES.IReportService);
    const result = await reportService.getPickupDropoffReportNew(
      arrivalStartDateTime,
      arrivalEndDateTime,
      departureStartDateTime,
      departureEndDateTime,
      session.user
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
