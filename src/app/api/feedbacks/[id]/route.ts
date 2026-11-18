import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { auth } from "@/app/auth";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import IFeedbackService from "@/core/services/contracts/IFeedbackService";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("DELETE api/feedbacks/[id]");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);
    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;

    const { id } = await context.params;
    const feedbackService = container.get<IFeedbackService>(TYPES.IFeedbackService);
    await feedbackService.deleteFeedback(id, session.user);

    return NextResponse.json({ message: "Deleted" }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}
