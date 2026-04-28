import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import IReservationService from "@/core/services/contracts/IReservationService";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import { z } from "zod";
import { invoiceStatusUpdateValidator } from "@/core/validators/zodschema";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("PATCH /api/reservations/[id]/invoice-status");
    c.d(JSON.stringify(request));

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;
    c.d(session.user);

    const body = await request.json();
    c.d(body);

    const validatedPayload = await invoiceStatusUpdateValidator.safeParseAsync(body);
    if (!validatedPayload.success) {
      c.d("Invoice status payload invalid");
      c.d(validatedPayload.error.flatten());
      return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.BadRequest });
    }

    const { id } = await context.params;
    if (!id) {
      c.i('No reservationId. Return invalid response.');
      return NextResponse.json({ status: HttpStatusCode.BadRequest });
    }

    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    await reservationService.reservationUpdateInvoiceStatus(id, validatedPayload.data.invoiceStatus, validatedPayload.data.invoiceNumber, session.user);

    c.fe('PATCH /api/reservations/[id]/invoice-status');
    return NextResponse.json({ message: "Invoice status updated successfully." }, { status: HttpStatusCode.Ok });
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
