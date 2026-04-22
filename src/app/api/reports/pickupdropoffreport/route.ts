import { NextRequest, NextResponse } from "next/server";
import { container } from '@/core/di/dicontainer';
import { TYPES } from '@/core/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import { HttpStatusCode } from '@/core/constants';
import IReportService from '@/core/services/contracts/IReportService';
import { auth } from '@/app/auth';
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";

export async function GET(request: NextRequest) {
    try {
        c.fs('GET /api/reports/pickupdropoffreport');

        const session = await auth();
        if (!session?.user)
            throw new CustomError('Invalid session', HttpStatusCode.BadRequest);

        if (!request.headers.get('X-Resort-Location'))
            throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
        session.user.location = request.headers.get('X-Resort-Location') || undefined;
        c.d(session.user);

        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        const arrivalDepartureDate = searchParams.arrivalDepartureDate ?? '';

        const service = container.get<IReportService>(TYPES.IReportService);
        const data = await service.getPickupDropoffReport(arrivalDepartureDate, session.user);
        return NextResponse.json({ data }, { status: HttpStatusCode.Ok });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        const logService = container.get<ILogService>(TYPES.ILogService);
        await logService.logError(error);
        if (error instanceof CustomError)
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        else
            return NextResponse.json({ message: 'Unknown error occured.' }, { status: HttpStatusCode.ServerError });
    }
}
