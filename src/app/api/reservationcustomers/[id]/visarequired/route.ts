import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import ICustomerService from "@/core/services/contracts/ICustomerService";
import { auth } from "@/app/auth";
import { visaRequiredUpdateValidator } from "@/core/validators/zodschema";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("PATCH /api/reservationcustomers/[id]/visarequired");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;

    const body = await request.json();
    const validatedPayload = await visaRequiredUpdateValidator.safeParseAsync(body);
    if (!validatedPayload.success) {
      c.d(validatedPayload.error.flatten());
      return NextResponse.json({ message: 'Visa required update failed.' }, { status: HttpStatusCode.BadRequest });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: 'Reservation customer id is required.' }, { status: HttpStatusCode.BadRequest });
    }

    const customerService = container.get<ICustomerService>(TYPES.ICustomerService);
    await customerService.customerUpdateVisaRequired(id, validatedPayload.data.visaRequired, session.user);

    c.fe('PATCH /api/reservationcustomers/[id]/visarequired');
    return NextResponse.json({ message: 'Visa requirement updated successfully.' }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: 'Unknown error occured.' }, { status: HttpStatusCode.ServerError });
  }
}
