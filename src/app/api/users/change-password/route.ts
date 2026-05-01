import { NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import IUserService from "@/core/services/contracts/IUserService";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";
import { userPasswordChangeSchema } from "@/core/validators/zodschema";

export async function POST(request: Request) {
  try {
    c.fs("POST /api/users/change-password");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);

    const locationHeader = request.headers.get('X-Resort-Location');
    if (!locationHeader)
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);

    session.user.location = locationHeader;
    c.d(session.user);

    const body = await request.json();
    const parsed = userPasswordChangeSchema.safeParse(body);
    if (!parsed.success)
      throw new CustomError('Invalid request data', HttpStatusCode.BadRequest);

    const service = container.get<IUserService>(TYPES.IUserService);
    await service.userUpdatePassword(session.user.id, parsed.data.currentPassword, parsed.data.newPassword, session.user);

    c.fe("POST /api/users/change-password");
    return NextResponse.json({ message: "Password changed successfully." }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknown error occured." }, { status: HttpStatusCode.ServerError });
  }
}
