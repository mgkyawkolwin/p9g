import { NextResponse } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/core/domain/services/contracts/IUserService";
import { TYPES } from "@/core/lib/types";
import c from "@/core/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/lib/constants";
import { CustomError } from "@/core/lib/errors";
import ILogService from "@/core/domain/services/contracts/ILogService";


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("GET /api/users/[id]");
        c.d(JSON.stringify(await params));
        const { id } = await params;
        const service = container.get<IUserService>(TYPES.IUserService);
        const result = await service.userFindById(parseInt(id));
        if (!result) {
            return NextResponse.json({ message: "Not found." }, { status: HttpStatusCode.NotFound });
        }
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


export async function PUT(request: Request, { params }: { params: Promise<{ id: number }> }) {
    try {
        c.fs('PUT /api/users/[id]');
        const body = await request.json();
        const { id } = await params;
        const service = container.get<IUserService>(TYPES.IUserService);
        // find existing user
        const user = await service.userFindById(id);
        if (!user) {
            return NextResponse.json({ message: "Not found." }, { status: HttpStatusCode.NotFound });
        }
        // update user
        const updatedUser = await service.userUpdate(id, body);
        if (!updatedUser) {
            return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.NotFound });
        }
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



export async function DELETE(request: Request, { params }: { params: Promise<{ id: number }> }) {
    try {
        c.fs('DELETE /api/users/[id]');
        const { id } = await params;
        const service = container.get<IUserService>(TYPES.IUserService);
        const result = await service.userDelete(id);
        if (!result) {
            return NextResponse.json({ message: "Fail delete." }, { status: 404 });
        }
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