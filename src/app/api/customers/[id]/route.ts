import { db } from "@/data/orm/drizzle/mysql/db";
import { user } from "@/data/orm/drizzle/mysql/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { container } from "@/dicontainer";
import IUserService from "@/services/contracts/IUserService";
import { TYPES } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import ICustomerService from "@/services/contracts/ICustomerService";


export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        c.i("GET /api/customers/[id]");
        c.d(JSON.stringify(await params));
        const { id } = await params;
        const service = container.get<ICustomerService>(TYPES.ICustomerService);
        const result = await service.customerFindById(parseInt(id));
        if (!result) {
            return NextResponse.json({ message: "Not found." }, { status: 404 });
        }
        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json({ message: "Unknow error occured." }, { status: 500 });
    }
}


export async function PUT(request: Request, { params }: { params: { id: number } }) {
    try{
        c.i("PUT api/customers[id]");
        const body = await request.json();
        c.d(body);
        const { id } = await params;
        const service = container.get<ICustomerService>(TYPES.ICustomerService);
        // find existing user
        const user = await service.customerFindById(id);
        if (!user) {
            return NextResponse.json({ message: "Not found." }, { status: 404 });
        }
        // update user
        const updatedUser = await service.customerUpdate(id, body);
        if(!updatedUser){
            return NextResponse.json({ message: "Update failed." }, { status: 404 });
        }
        return NextResponse.json({ message: "Updated" }, { status: 201 });
    }catch(error){
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json({ message: "Unknow error occured." }, { status: 500 });
    }
}



export async function DELETE(request: Request, { params }: { params: { id: number } }) {
    try{
        const {id} = await params;
        const service = container.get<IUserService>(TYPES.IUserService);
        const result = await service.userDelete(id);
        if (!result) {
            return NextResponse.json({ message: "Fail delete." }, { status: 404 });
        }
        return NextResponse.json({ message: "Deleted" }, { status: 200 });
    }catch(error){
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json({ message: "Unknow error occured." }, { status: 500 });
    }
}