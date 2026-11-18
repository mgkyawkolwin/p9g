import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { auth } from "@/app/auth";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import IFeedbackService from "@/core/services/contracts/IFeedbackService";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("GET /api/customers/[id]/feedbacks");
    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);
    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);

    const { id } = await context.params;
    const pageIndex = Math.max(Number(request.nextUrl.searchParams.get('pageIndex')) || 1, 1);
    const pageSize = Math.min(Math.max(Number(request.nextUrl.searchParams.get('pageSize')) || 10, 1), 100);
    const service = container.get<IFeedbackService>(TYPES.IFeedbackService);
    const [data, records] = await service.findFeedbacksByCustomerId(id, pageIndex, pageSize);
    const pager = { pageIndex, pageSize, records, pages: Math.ceil(records / pageSize) };
    return NextResponse.json({ data, pager }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}
