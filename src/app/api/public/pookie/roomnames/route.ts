import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "@/core/constants";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import IPookieService from "@/core/services/contracts/IPookieService";
import { pookieGetRoomValidator } from "@/core/validators/zodschema";


export async function GET(request: NextRequest) {
    try {
        c.fs("POST api/public/pookie/roomnames");

        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        c.d(searchParams);

        const validatedData = await pookieGetRoomValidator.safeParseAsync(searchParams);
        if (!validatedData.success) {
            c.d("Data is invalid. Return result.");
            c.d(validatedData.error.flatten().fieldErrors);
            return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
        }

        const session = { user: { location: searchParams.location, id: "00000000-0000-0000-0000-000000000000" } }

        // update user
        c.i("Calling service.");
        const service = container.get<IPookieService>(TYPES.IPookieService);
        const roomsAndPax = await service.getRoomsAndPax(validatedData.data.drawDate, session.user);

        c.fe("GET /api/pookie/roomnames");
        return NextResponse.json(
            { message: undefined, data: { roomsAndPax: roomsAndPax } },
            {
                status: HttpStatusCode.Ok,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            },
        );
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


// Handle OPTIONS method for preflight requests
export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}