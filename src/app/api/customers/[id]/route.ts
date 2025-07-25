import { NextRequest, NextResponse } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/domain/services/contracts/IUserService";
import { TYPES } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import ICustomerService from "@/domain/services/contracts/ICustomerService";
import { customerValidator } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import Customer from "@/domain/models/Customer";
import { CustomError } from "@/lib/errors";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        c.i("GET /api/customers/[id]");
        c.d(JSON.stringify(await params));
        const { id } = await params;
        const service = container.get<ICustomerService>(TYPES.ICustomerService);
        const result = await service.customerFindById(parseInt(id));
        if (!result) {
            return NextResponse.json({ message: "Not found." }, { status: HttpStatusCode.NotFound });
        }
        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        if(error instanceof CustomError)
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
          else
            return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
    }
}


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    try{
        c.i("PUT api/customers[id]");
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
        
        if(!validatedCustomer){
            return NextResponse.json({ message: "Invalid input" }, { status: HttpStatusCode.BadRequest });
        }
        c.d(validatedCustomer.data);
        // update user
        const updatedUser = await service.customerUpdate(id, validatedCustomer.data as unknown as Customer);
        if(!updatedUser){
            return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.ServerError });
        }
        return NextResponse.json({ message: "Updated" }, { status: HttpStatusCode.Ok });
    }catch(error){
        c.e(error instanceof Error ? error.message : String(error));
        if(error instanceof CustomError)
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
          else
            return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
    }
}



export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    try{
        const {id} = await params;
        const service = container.get<IUserService>(TYPES.IUserService);
        const result = await service.userDelete(id);
        if (!result) {
            return NextResponse.json({ message: "Fail delete." }, { status: HttpStatusCode.ServerError });
        }
        return NextResponse.json({ message: "Deleted" }, { status: HttpStatusCode.Ok });
    }catch(error){
        c.e(error instanceof Error ? error.message : String(error));
        if(error instanceof CustomError)
                  return NextResponse.json({ message: error.message }, { status: error.statusCode });
                else
                  return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
    }
}