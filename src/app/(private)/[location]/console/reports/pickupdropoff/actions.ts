'use server';
import { headers } from 'next/headers';
import c from '@/lib/loggers/console/ConsoleLogger';
import { FormState } from '@/core/types';

export async function getPickupDropoffReport(
  arrivalStartDateTime: string,
  arrivalEndDateTime: string,
  departureStartDateTime: string,
  departureEndDateTime: string,
  location: string
): Promise<FormState> {
  try {
    c.fs('Actions > getPickupDropoffReport');
    const url = process.env.API_URL +
      `reports/pickupdropoffreport?arrivalStartDateTime=${encodeURIComponent(arrivalStartDateTime)}&arrivalEndDateTime=${encodeURIComponent(arrivalEndDateTime)}&departureStartDateTime=${encodeURIComponent(departureStartDateTime)}&departureEndDateTime=${encodeURIComponent(departureEndDateTime)}`;
    c.d(url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        cookie: (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
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
