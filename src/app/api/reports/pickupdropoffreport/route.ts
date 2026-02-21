import { NextRequest, NextResponse } from "next/server";
import { container } from '@/core/di/dicontainer';
import { TYPES } from '@/core/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import { HttpStatusCode } from '@/core/constants';
import IReportService from '@/core/services/contracts/IReportService';
import { auth } from '@/app/auth';

export async function GET(request: NextRequest) {
    try {
        c.fs('GET /api/reports/pickupdropoffreport');

        const session = await auth();
        if (!session?.user) return NextResponse.json({ message: 'Invalid session' }, { status: HttpStatusCode.BadRequest });

        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        const arrivalDepartureDate = searchParams.arrivalDepartureDate ?? '';

        const service = container.get<IReportService>(TYPES.IReportService);
        const data = await service.getPickupDropoffReport(arrivalDepartureDate, session.user);
        return NextResponse.json({ data }, { status: HttpStatusCode.Ok });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json({ message: 'Unknown error occured.' }, { status: HttpStatusCode.ServerError });
    }
}
