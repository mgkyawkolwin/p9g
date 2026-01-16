'use server';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';

export async function getDailySummaryPersonReport(startDate: string, endDate: string, reservationStatus: string): Promise<FormState> {
  try {
    c.fs('Actions > getDailySummaryPersonReport');

    //retrieve users
    c.i("Get report by calling api.");
    const response = await fetch(process.env.API_URL + `reports/dailysummarypersonreport?startDate=${startDate}&endDate=${endDate}&reservationStatus=${reservationStatus === 'DEFAULT' ? '' : reservationStatus}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const responseData = await response.json();

    //fail
    if (!response.ok) {
      c.i("Report retrieval failed. Return response.");
      return { error: true, message: `Report retrieval failed. ${responseData.message}` };
    }

    //success
    c.i("Report retrieval successful.");
    c.d(responseData.data?.length);
    c.d(responseData.data?.length > 0 ? responseData.data[0] : []);

    //retrieve data from tuple
    c.fe('Actions > getDailySummaryPersonReport');
    return { error: false, message: '', data: responseData.data };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: "Report retrieval failed." };
  }
}