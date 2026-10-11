import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { prepaidPackageValidator } from "@/core/validators/zodschema";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import IPrepaidPackageService from "@/core/services/contracts/IPrepaidPackageService";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";


export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("PUT /api/packages/[id]");

    const session = await auth();
    if (!session?.user) throw new CustomError('Invalid session');

    const location = request.headers.get('X-Resort-Location');
    if (!location)
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = location;

    const { id } = await context.params;
    const body = await request.json();
    const validatedFields = await prepaidPackageValidator.safeParseAsync({ ...body, id });
    if (!validatedFields.success) {
      c.d(validatedFields.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
    }

    const service = container.get<IPrepaidPackageService>(TYPES.IPrepaidPackageService);
    const updated = await service.prepaidPackageUpdate(
      id,
      validatedFields.data as unknown as PrepaidPackage,
      session.user
    );

    return NextResponse.json({ message: "Updated", data: updated }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}
