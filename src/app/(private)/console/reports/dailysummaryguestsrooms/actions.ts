'use server';
import { FormState } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import { headers } from 'next/headers';

export async function getDailySummaryGuestsRoomsReport(startDate:string, endDate:string): Promise<FormState> {
  try{
    c.fs('Actions > getDailySummaryGuestsRoomsReport');

    //retrieve users
    c.i("Update successful. Get the updated list based on query string.");
    const response = await fetch(process.env.API_URL + `reports/dailysummaryguestsroomsreport?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Report retrieval failed. Return response.");
      return {error:true, message : `Report retrieval failed. ${responseData.message}`};
    }

    //success
    c.i("Report retrieval successful.");
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    c.fe('Actions > getDailySummaryGuestsRoomsReport');
    return {error:false, message: '', data: responseData.data};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Report retrieval failed."};
  }
}