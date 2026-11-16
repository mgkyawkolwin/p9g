'use server';

import { FormState } from '@/core/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import { headers } from 'next/headers';

export async function birthdayReportGetList(formState: FormState, formData: FormData): Promise<FormState> {
  try {
    c.fs('Actions > birthdayReportGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const location = formData.get('location')?.toString() ?? '';
    const date = formData.get('date')?.toString() ?? '';
    const pageIndex = formData.get('pageIndex')?.toString() || '1';
    const pageSize = formData.get('pageSize')?.toString() || '10';

    const queryString = new URLSearchParams({ date, pageIndex, pageSize }).toString();

    const response = await fetch(process.env.API_URL + `reports/birthdayreport?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      },
      cache: 'no-store'
    });

    const responseData = await response.json();
    c.d(responseData);

    if (!response.ok) {
      return { error: true, message: responseData.message || 'Birthday report retrieval failed.' };
    }

    return { error: false, message: '', data: responseData.data?.birthdays ?? [], pager: responseData.data?.pager };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const message = error instanceof Error ? error.message : 'Unknown error occured.';
    return { error: true, message };
  }
}
