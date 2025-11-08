'use server';

import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';
import PookieTimeTable from '@/core/models/domain/PookieTimeTable';


export async function draw(date:Date, rooms: string, noOfPeople: number): Promise<FormState> {
  try{
    c.fs('Actions > draw');
    
    c.i("Request api to generate pookie time table.");
    const response = await fetch(process.env.API_URL + `pookie/draw?drawDate=${date.toISOString()}&rooms=${rooms}&noOfPeople=${noOfPeople}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Draw failed. Return response.");
      return {error:true, message : `Draw failed. ${responseData.message}`};
    }
      
    c.i("Draw success.");
    c.d(responseData.data?.timeTable);

    c.fe('Actions > draw');
    const successresponse = {error:false, message : undefined, data: {timeTable:responseData.data.timeTable}};
    
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}