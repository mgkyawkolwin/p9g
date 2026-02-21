'use server';
import { headers } from 'next/headers';
import c from '@/lib/loggers/console/ConsoleLogger';
import { getISODateTimeMidNightString } from '@/lib/utils';
import { FormState } from '@/core/types';

export async function getPickupDropoffReport(arrivalDepartureDate: string): Promise<FormState> {
  try {
    c.fs('Actions > getPickupDropoffReport');
    const url = process.env.API_URL + `reports/pickupdropoffreport?arrivalDepartureDate=${arrivalDepartureDate}`;
    c.d(url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? ''
      }
    });

    const responseData = await response.json();
    if (!response.ok) {
      return { error: true, message: responseData.message ?? 'Report retrieval failed.' };
    }

    return { error: false, message: '', data: responseData.data };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Report retrieval failed.' };
  }
}
