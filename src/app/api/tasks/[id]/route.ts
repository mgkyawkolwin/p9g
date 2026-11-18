import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import ITaskService from "@/core/services/contracts/ITaskService";
import Task from "@/core/models/domain/Task";
import { auth } from "@/app/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("PUT /api/tasks/[id]");
    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);
    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;

    const { id } = await context.params;
    const body = await request.json();
    const task = new Task();
    task.description = String(body.description ?? '');
    task.department = typeof body.department === 'string' && body.department ? body.department : null;
    task.status = String(body.status ?? '');
    task.remark = typeof body.remark === 'string' && body.remark ? body.remark : null;
    if (body.targetCompletionDateTime) {
      const target = new Date(body.targetCompletionDateTime);
      if (Number.isNaN(target.getTime()))
        throw new CustomError('Invalid target completion date time', HttpStatusCode.BadRequest);
      task.targetCompletionDateTime = target;
    }

    const service = container.get<ITaskService>(TYPES.ITaskService);
    await service.updateTask(id, task, session.user);

    return NextResponse.json({ message: "Task updated." }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}
