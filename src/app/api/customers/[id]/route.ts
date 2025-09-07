import { NextRequest, NextResponse } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/core/domain/services/contracts/IUserService";
import { TYPES } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import ICustomerService from "@/core/domain/services/contracts/ICustomerService";
import { customerValidator } from "@/core/validation/zodschema";
import { HttpStatusCode } from "@/core/lib/constants";
import Customer from "@/core/domain/models/Customer";
import { CustomError } from "@/core/lib/errors";
import ILogService from "@/core/domain/services/contracts/ILogService";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("GET /api/customers/[id]");
        c.d(JSON.stringify(await params));
        const { id } = await params;
        const service = container.get<ICustomerService>(TYPES.ICustomerService);
        const result = await service.customerFindById(id);
        if (!result) {
            return NextResponse.json({ message: "Not found." }, { status: HttpStatusCode.NotFound });
        }
        return NextResponse.json({ data: result }, { status: 200 });
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


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.fs("PUT api/customers/[id]");
        const body = await request.json();
        c.d(body);
        const { id } = await params;
        const service = container.get<ICustomerService>(TYPES.ICustomerService);
        // find existing user
        const user = await service.customerFindById(id);
        if (!user) {
            return NextResponse.json({ message: "Not found." }, { status: HttpStatusCode.NotFound });
        }

        const validatedCustomer = await customerValidator.safeParseAsync(body);

        if (!validatedCustomer) {
            return NextResponse.json({ message: "Invalid input" }, { status: HttpStatusCode.BadRequest });
        }
        c.d(validatedCustomer.data);
        // update user
        const updatedUser = await service.customerUpdate(id, validatedCustomer.data as unknown as Customer);
        if (!updatedUser) {
            return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.ServerError });
        }
        return NextResponse.json({ message: "Updated" }, { status: HttpStatusCode.Ok });
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



export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // try {
    //     const { id } = await params;
    //     const service = container.get<IUserService>(TYPES.IUserService);
    //     const result = await service.userDelete(id);
    //     if (!result) {
    //         return NextResponse.json({ message: "Fail delete." }, { status: HttpStatusCode.ServerError });
    //     }
    //     return NextResponse.json({ message: "Deleted" }, { status: HttpStatusCode.Ok });
    // } catch (error) {
    //     c.e(error instanceof Error ? error.message : String(error));
    //     const logService = container.get<ILogService>(TYPES.ILogService);
    //     await logService.logError(error);
    //     const logService = container.get<ILogService>(TYPES.ILogService);
    //     await logService.logError(error);
    //     if (error instanceof CustomError)
    //         return NextResponse.json({ message: error.message }, { status: error.statusCode });
    //     else
    //         return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
    // }
}