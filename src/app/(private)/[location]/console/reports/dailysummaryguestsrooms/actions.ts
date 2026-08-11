'use server';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';

export async function getDailySummaryGuestsRoomsReport(startDate:string, endDate:string, reservationStatus: string, location: string): Promise<FormState> {
  try{
    c.fs('Actions > getDailySummaryGuestsRoomsReport');

    //retrieve users
    c.i("Update successful. Get the updated list based on query string.");
    const reservationStatusQuery = reservationStatus ? encodeURIComponent(reservationStatus) : '';
    const url = process.env.API_URL + `reports/dailysummaryguestsroomsreport?startDate=${startDate}&endDate=${endDate}${reservationStatusQuery ? `&reservationStatus=${reservationStatusQuery}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie'),
        'X-Resort-Location': location
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
    c.d(responseData.data?.length);
    c.d(responseData.data?.length > 0 ? responseData.data[0] : []);

    //retrieve data from tuple
    c.fe('Actions > getDailySummaryGuestsRoomsReport');
    return {error:false, message: '', data: responseData.data};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Report retrieval failed."};
  }
}