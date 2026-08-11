'use server';
import { FormState } from '@/core/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import { headers } from 'next/headers';

export async function getMonthlySummaryReservationStatusReport(year: string, location: string): Promise<FormState> {
    try {
        c.fs('Actions > getMonthlySummaryReservationStatusReport');
        c.i('Get report by calling api.');

        const response = await fetch(process.env.API_URL + `reports/monthlysummaryreservationstatusreport?year=${year}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'cookie': (await headers()).get('cookie'),
                'X-Resort-Location': location
            }
        });

        const responseData = await response.json();

        if (!response.ok) {
            c.i('Report retrieval failed. Return response.');
            return { error: true, message: `Report retrieval failed. ${responseData.message}` };
        }

        c.i('Report retrieval successful.');
        c.d(responseData.data?.length);
        c.d(responseData.data?.length > 0 ? responseData.data[0] : []);
        c.fe('Actions > getMonthlySummaryReservationStatusReport');

        return { error: false, message: '', data: responseData.data };
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return { error: true, message: 'Report retrieval failed.' };
    }
}
