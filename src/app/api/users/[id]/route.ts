import { NextResponse } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/core/domain/services/contracts/IUserService";
import { TYPES } from "@/core/lib/types";
import c from "@/core/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/lib/constants";
import { CustomError } from "@/core/lib/errors";
import ILogService from "@/core/domain/services/contracts/ILogService";
import { auth } from "@/app/auth";


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("GET /api/users/[id]");
        c.d(JSON.stringify(await params));

        const session = await auth();
        if (!session?.user)
            throw new CustomError('Invalid session');

        const { id } = await params;
        const service = container.get<IUserService>(TYPES.IUserService);
        const result = await service.userFindById(id, session.user);
        if (!result) {
            return NextResponse.json({ message: "Not found." }, { status: HttpStatusCode.NotFound });
        }

        c.fe("GET /api/users/[id]");
        return NextResponse.json({ data: result }, { status: HttpStatusCode.Ok });
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


export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs('PUT /api/users/[id]');

        const session = await auth();
        if (!session?.user)
            throw new CustomError('Invalid session');

        const body = await request.json();
        const { id } = await params;
        const service = container.get<IUserService>(TYPES.IUserService);
        // find existing user
        const user = await service.userFindById(id, session.user);
        if (!user) {
            return NextResponse.json({ message: "Not found." }, { status: HttpStatusCode.NotFound });
        }
        // update user
        await service.userUpdate(id, body, session.user);

        c.fe('PUT /api/users/[id]');
        return NextResponse.json({ message: "Updated" }, { status: HttpStatusCode.Created });
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



export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs('DELETE /api/users/[id]');

        const session = await auth();
        if (!session?.user)
            throw new CustomError('Invalid session');

        const { id } = await params;
        const service = container.get<IUserService>(TYPES.IUserService);
        await service.userDelete(id, session.user);
        
        c.fe('DELETE /api/users/[id]');
        return NextResponse.json({ message: "Deleted" }, { status: 200 });
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