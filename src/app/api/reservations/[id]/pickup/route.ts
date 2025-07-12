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

export async function PATCH(request: NextRequest,{ params }: { params: { id: string } }) {
    try{
      c.i("PATCH /api/reservations/[id]/pickup");
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
          
      //call service to retrieve data
      const reservationService = container.get<IReservationService>(TYPES.IReservationService);
      await reservationService.updatePickUpCarNo(id, searchParams.carNo);
      
  
      c.i('Return PATCH /api/reservations/[id]/pickup');
      return NextResponse.json({status: HttpStatusCode.Ok});
    }catch(error){
      c.e(error instanceof Error ? error.message : String(error));
      return NextResponse.json(error, { status: HttpStatusCode.ServerError });
    }
  }