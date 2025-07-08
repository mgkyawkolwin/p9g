import { db } from "@/data/orm/drizzle/mysql/db";
import { userTable } from "@/data/orm/drizzle/mysql/schema";
import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import IUserService from "@/domain/services/contracts/IUserService";
import { TYPES, PagerParams, SearchParam } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { pagerSchema, reservationValidator, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, pagerWithDefaults } from "@/lib/utils";
import ICustomerService from "@/domain/services/contracts/ICustomerService";
import IReservationService from "@/domain/services/contracts/IReservationService";


export async function GET(request: NextRequest,{ params }: { params: { id: string } }) {
  try{
    c.i("GET /api/reservations/[id]");
    c.d(JSON.stringify(request));
    

    //retrieve search params from request
    const p = await params;
    c.d(p);
    const { id } = p;

    if(!id){
        c.i('No reservationId. Return invalid response.');
        return NextResponse.json({status: HttpStatusCode.BadRequest});
    }
        
    //call service to retrieve data
    const reservationService = container.get<IReservationService>(TYPES.IReservationService);
    const result = await reservationService.reservationFindById(id);
    c.d(JSON.stringify(result));

    c.i('Return GET /api/reservations/[id]');
    return NextResponse.json({data : result}, {status: HttpStatusCode.Ok});
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return NextResponse.json(error, { status: HttpStatusCode.ServerError });
  }
}


export async function PATCH(request: NextRequest,{ params }: { params: { id: string } }) {
    try{
      c.i("PATCH /api/reservations/[id]");
      c.d(JSON.stringify(request));

      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  
      //retrieve search params from request
      const p = await params;
      c.d(p);
      const { id } = p;
  
      if(!id){
          c.i('No reservationId. Return invalid response.');
          return NextResponse.json({status: HttpStatusCode.BadRequest});
      }

      if(!searchParams.operation){
        c.i('Invalid operation. Return invalid response.');
        return NextResponse.json({status: HttpStatusCode.BadRequest});
        }
          
      //call service to retrieve data
      const reservationService = container.get<IReservationService>(TYPES.IReservationService);
      await reservationService.patch(id, searchParams.operation);
      
  
      c.i('Return PATCH /api/reservations/[id]');
      return NextResponse.json({status: HttpStatusCode.Ok});
    }catch(error){
      c.e(error instanceof Error ? error.message : String(error));
      return NextResponse.json(error, { status: HttpStatusCode.ServerError });
    }
  }


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try{
        c.i("POST api/reservations/[id]/update");
        c.i("Retrieving post body.")
        const body = await request.json();
        c.d(body);

        const {id} = await params;

        c.i("Validating post data.");
        const validatedReservation = await reservationValidator.safeParseAsync(body);
        
        if(!validatedReservation.success){
            c.d("Reservation data is invalid. Return result.");
            c.d(validatedReservation.error.flatten());
            return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.BadRequest });
        }

        // update user
        c.i("Calling service.");
        const reservationService = container.get<IReservationService>(TYPES.IReservationService);
        const createdReservation = await reservationService.updateReservation(id, validatedReservation.data as any);
        if(!createdReservation){
            c.d("Reservaton creation failed. Return result.");
            return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.ServerError });
        }

        c.i("Everything is fine. Return final result.");
        return NextResponse.json({ message: "Updated" }, { status: HttpStatusCode.Ok });
    }catch(error){
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
    }
}