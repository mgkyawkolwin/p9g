'use server';
import {  reservationValidator} from '@/core/validators/zodschema';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';
import Reservation from '@/core/models/domain/Reservation';
import PookieTimeTable from '@/core/models/domain/PookieTimeTable';

export async function generateTimeTable(date:Date, start:Date, end:Date): Promise<FormState> {
  try{
    c.fs('Actions > generateTimeTable');

    let queryString = null;
    const message = "";

    c.i("Retrieving latest reservation list.")
    //define default pageer fields for new reservation list
    const pager = {orderBy: "createdAtUTC", orderDirection: "desc", pageIndex: 1, pageSize: 10};
    queryString = buildQueryString(pager);
    c.d(queryString);
    
    c.i("Request api to generate pookie time table.");
    const response = await fetch(process.env.API_URL + `pookie/timetable?date=${date.toISOString()}&start=${start.toISOString()}&end=${end.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Timetable generation failed. Return response.");
      return {error:true, message : `Timetable generation failed. ${responseData.message}`};
    }
      
    c.i("Timetable generation success.");
    c.d(responseData.data?.timetable?.length);
    c.d(responseData.data?.timetable?.length > 0 ? responseData.data.timetable[0] : []);

    c.fe('Actions > getTopReservationsAction');
    const successresponse = {error:false, message : message, data: {reservations:responseData.data.reservations}};
    //c.d(successresponse);
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}

