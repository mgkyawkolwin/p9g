import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { feedbackValidator, reservationPatchValidator, reservationValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import IReservationService from "@/core/services/contracts/IReservationService";
import Reservation from "@/core/models/domain/Reservation";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IFeedbackService from "@/core/services/contracts/IFeedbackService";
import Feedback from "@/core/models/domain/Feedback";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET api/feedbacks");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);
    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);

    const params = request.nextUrl.searchParams;
    const reservationId = params.get('reservationId') ?? '';
    const customerId = params.get('customerId') ?? '';
    const pageIndex = Math.max(Number(params.get('pageIndex')) || 1, 1);
    const pageSize = Math.min(Math.max(Number(params.get('pageSize')) || 10, 1), 100);

    const feedbackService = container.get<IFeedbackService>(TYPES.IFeedbackService);
    const [data, records] = await feedbackService.findFeedbacksByReservationCustomer(reservationId, customerId, pageIndex, pageSize);
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


export async function POST(request: NextRequest) {
  try {
    c.fs("POST api/feedbacks");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;
    c.d(session.user);

    const body = await request.json();
    c.d(body);

    c.i("Validating post data.");
    const validatedFeedback = await feedbackValidator.safeParseAsync(body);

    if (!validatedFeedback.success) {
      c.d("Feedback data is invalid. Return result.");
      c.d(validatedFeedback.error.flatten());
      return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.BadRequest });
    }

    // update user
    c.i("Calling service.");
    const feedbackService = container.get<IFeedbackService>(TYPES.IFeedbackService);
    await feedbackService.createFeedback(validatedFeedback.data as unknown as Feedback, session.user);

    c.fe("POST api/feedbacks");
    return NextResponse.json({ message: "Updated" }, { status: HttpStatusCode.Ok });
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