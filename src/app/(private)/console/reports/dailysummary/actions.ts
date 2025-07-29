'use server';
import { pagerValidator, searchSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';

export async function getDailySummaryReport(startDate:string, endDate:string): Promise<FormState> {
  try{
    c.i('Actions > /console/checkin > getDailySummaryReport');

    //retrieve users
    c.i("Update successful. Get the updated list based on query string.");
    const response = await fetch(process.env.API_URL + `reports/dailysummaryreport?startDate=${startDate}&endDate=${endDate}`, {
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
    c.i("Everything is alright. Return response.");
    return {error:false, message: '', data: responseData.data};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Report retrieval failed."};
  }
}