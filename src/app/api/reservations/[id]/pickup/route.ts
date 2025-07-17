import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { HttpStatusCode } from "@/lib/constants";
import IReservationService from "@/domain/services/contracts/IReservationService";

export async function PATCH(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
    try{
      c.i("PATCH /api/reservations/[id]/pickup");
      c.d(JSON.stringify(request));

      const searchParams = Object.fromEntries(request.nextUrl.searchParams);

      const body = await request.json();
  
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
      await reservationService.updatePickUpCarNo(id, body.carNo);
      
  
      c.i('Return PATCH /api/reservations/[id]/pickup');
      return NextResponse.json({status: HttpStatusCode.Ok});
    }catch(error){
      c.e(error instanceof Error ? error.message : String(error));
      return NextResponse.json(error, { status: HttpStatusCode.ServerError });
    }
  }