import { NextRequest, NextResponse } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { pagerValidator, taskSearchValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import { getPagerWithDefaults } from "@/core/helpers";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import ITaskService from "@/core/services/contracts/ITaskService";
import Task from "@/core/models/domain/Task";
import { auth } from "@/app/auth";

async function getSessionUser(request: NextRequest) {
  const session = await auth();
  if (!session?.user)
    throw new CustomError('Invalid session', HttpStatusCode.Unauthorized);
  if (!request.headers.get('X-Resort-Location'))
    throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
  session.user.location = request.headers.get('X-Resort-Location') || undefined;
  return session.user;
}

async function errorResponse(error: unknown) {
  c.e(error instanceof Error ? error.message : String(error));
  const logService = container.get<ILogService>(TYPES.ILogService);
  await logService.logError(error);
  if (error instanceof CustomError)
    return NextResponse.json({ message: error.message }, { status: error.statusCode });
  return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
}

export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/tasks");
    const sessionUser = await getSessionUser(request);

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const searchValidatedFields = await taskSearchValidator.safeParseAsync(searchParams);
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    const pager = getPagerWithDefaults(pagerValidatedFields.data);

    const service = container.get<ITaskService>(TYPES.ITaskService);
    const [tasks, records] = await service.taskFindMany(searchValidatedFields.data ?? {}, pager, sessionUser);

    return NextResponse.json({
      data: { tasks, pager: { ...pager, records, pages: Math.ceil(records / (pager.pageSize ?? 10)) } }
    }, { status: HttpStatusCode.Ok });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    c.fs("POST /api/tasks");
    const sessionUser = await getSessionUser(request);

    const body = await request.json();
    const service = container.get<ITaskService>(TYPES.ITaskService);

    if (body.feedbackId) {
      await service.createTaskFromFeedback(String(body.feedbackId), sessionUser);
      return NextResponse.json({ message: "Task created." }, { status: HttpStatusCode.Ok });
    }

    const task = new Task();
    task.reservationId = typeof body.reservationId === 'string' ? body.reservationId : null;
    task.customerId = typeof body.customerId === 'string' && body.customerId ? body.customerId : null;
    task.description = String(body.description ?? '');
    task.department = typeof body.department === 'string' ? body.department : null;
    task.remark = typeof body.remark === 'string' && body.remark ? body.remark : null;
    if (body.targetCompletionDateTime) {
      const target = new Date(body.targetCompletionDateTime);
      if (Number.isNaN(target.getTime()))
        throw new CustomError('Invalid target completion date time', HttpStatusCode.BadRequest);
      task.targetCompletionDateTime = target;
    }

    await service.createTask(task, sessionUser);

    return NextResponse.json({ message: "Task created." }, { status: HttpStatusCode.Ok });
  } catch (error) {
    return errorResponse(error);
  }
}
