import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { auth } from "@/app/auth";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import IMediaService from "@/core/services/contracts/IMediaService";
import ReservationCustomer from "@/core/models/domain/ReservationCustomer";
import type IRepository from "@/lib/repositories/IRepository";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; mediaId: string }> }) {
  try {
    c.fs("DELETE /api/reservationcustomer/[id]/tdacfiles/[mediaId]");

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;

    const { id, mediaId } = await context.params;
    if (!id || !mediaId) {
      return NextResponse.json({ message: 'Reservation customer id and media id are required.' }, { status: HttpStatusCode.BadRequest });
    }

    const reservationCustomerRepository = container.get<IRepository<ReservationCustomer>>(TYPES.IReservationCustomerRepository);
    const reservationCustomer = await reservationCustomerRepository.findById(id);
    if (!reservationCustomer) {
      throw new CustomError('Reservation customer not found.', HttpStatusCode.NotFound);
    }

    const mediaService = container.get<IMediaService>(TYPES.IMediaService);
    await mediaService.deleteMedia(mediaId, session.user);

    c.fe('DELETE /api/reservationcustomer/[id]/tdacfiles/[mediaId]');
    return NextResponse.json({ message: 'TDAC file deleted successfully.' }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: 'Unknown error occured.' }, { status: HttpStatusCode.ServerError });
  }
}
