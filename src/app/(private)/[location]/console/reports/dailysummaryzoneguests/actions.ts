'use server';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';

export async function getDailySummaryZoneGuestsReport(startDate: string, endDate: string, location: string): Promise<FormState> {
  try {
    c.fs('Actions > getDailySummaryZoneGuestsReport');

    const response = await fetch(process.env.API_URL + `reports/dailysummaryzoneguestsreport?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie'),
        'X-Resort-Location': location
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { error: true, message: `Report retrieval failed. ${responseData.message}` };
    }

    c.fe('Actions > getDailySummaryZoneGuestsReport');
    return { error: false, message: '', data: responseData.data };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: "Report retrieval failed." };
  }
}
