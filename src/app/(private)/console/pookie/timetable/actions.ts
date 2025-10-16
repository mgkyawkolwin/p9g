'use server';

import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';
import PookieTimeTable from '@/core/models/domain/PookieTimeTable';

export async function generateTimeTable(date:Date, start:Date, end:Date): Promise<FormState> {
  try{
    c.fs('Actions > generateTimeTable');
    
    c.i("Request api to generate pookie time table.");
    const response = await fetch(process.env.API_URL + `pookie/generate?drawDate=${date.toISOString()}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`, {
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

    c.fe('Actions > generateTimeTable');
    const successresponse = {error:false, message : 'Timetable generated.', data: {timeTable:responseData.data.timeTable}};
    
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}


export async function getTimeTable(date:Date): Promise<FormState> {
  try{
    c.fs('Actions > getTimeTable');
    
    c.i("Request api to generate pookie time table.");
    const response = await fetch(process.env.API_URL + `pookie/timetables?drawDate=${date.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Timetable get failed. Return response.");
      return {error:true, message : `Timetable get failed. ${responseData.message}`};
    }
      
    c.i("Timetable get success.");
    c.d(responseData.data?.timeTable?.length);
    c.d(responseData.data?.timeTable?.length > 0 ? responseData.data.timeTable[0] : []);

    c.fe('Actions > getTimeTable');
    const successresponse = {error:false, message : undefined, data: {timeTable:responseData.data.timeTable}};
    
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}


export async function updateTimeTable(timeTable:PookieTimeTable): Promise<FormState> {
  try{
    c.fs('Actions > updateTimeTable');
    
    c.i("Request api to generate pookie time table.");
    const response = await fetch(process.env.API_URL + `pookie/timetables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify({timeTable: timeTable}),
    });
    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Timetable update failed. Return response.");
      return {error:true, message : `Timetable update failed. ${responseData.message}`};
    }

    c.fe('Actions > updateTimeTable');
    const successresponse = {error:false, message : 'Timetable updated.'};
    
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}