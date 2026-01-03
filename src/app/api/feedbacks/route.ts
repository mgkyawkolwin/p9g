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


export async function POST(request: NextRequest) {
  try {
    c.fs("POST api/feedbacks");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

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
    await feedbackService.createOrUpdateFeedback(validatedFeedback.data as unknown as Feedback, session.user);

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