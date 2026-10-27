import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { prepaidPackagePaymentValidator } from "@/core/validators/zodschema";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IPrepaidPackageService from "@/core/services/contracts/IPrepaidPackageService";
import PrepaidPackagePayment from "@/core/models/domain/PrepaidPackagePayment";


export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; paymentId: string }> }) {
  try {
    c.fs("PUT /api/packages/[id]/payments/[paymentId]");

    const session = await auth();
    if (!session?.user) throw new CustomError('Invalid session');

    const location = request.headers.get('X-Resort-Location');
    if (!location) throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = location;

    const { id, paymentId } = await context.params;
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json({ message: "Payment payload must be valid JSON." }, { status: HttpStatusCode.BadRequest });
    }

    const validatedFields = await prepaidPackagePaymentValidator.safeParseAsync(requestBody);
    if (!validatedFields.success) {
      c.d(validatedFields.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
    }

    const service = container.get<IPrepaidPackageService>(TYPES.IPrepaidPackageService);
    const payment = await service.prepaidPackagePaymentUpdate(
      id,
      paymentId,
      Object.assign(new PrepaidPackagePayment(), validatedFields.data),
      session.user
    );

    return NextResponse.json({ data: { payment } }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}


export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; paymentId: string }> }) {
  try {
    c.fs("DELETE /api/packages/[id]/payments/[paymentId]");

    const session = await auth();
    if (!session?.user) throw new CustomError('Invalid session');

    const location = request.headers.get('X-Resort-Location');
    if (!location) throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = location;

    const { id, paymentId } = await context.params;
    const service = container.get<IPrepaidPackageService>(TYPES.IPrepaidPackageService);
    await service.prepaidPackagePaymentDelete(id, paymentId, session.user);

    return NextResponse.json({ message: 'Deleted' }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError) return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}