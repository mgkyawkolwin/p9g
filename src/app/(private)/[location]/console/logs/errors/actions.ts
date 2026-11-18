'use server';

import { headers } from 'next/headers';
import { FormState } from '@/core/types';
import { pagerValidator, searchValidator } from '@/core/validators/zodschema';
import { buildQueryString } from '@/lib/utils';
import c from '@/lib/loggers/console/ConsoleLogger';

export async function errorLogGetList(formState: FormState, formData: FormData): Promise<FormState> {
  try {
    const fields = Object.fromEntries(Array.from(formData.entries()).filter(([, value]) => value !== ''));
    const pager = pagerValidator.safeParse(fields);
    const search = searchValidator.safeParse(fields);
    const query = new URLSearchParams();
    if (pager.success) new URLSearchParams(buildQueryString(pager.data)).forEach((value, key) => query.set(key, value));
    if (search.success) new URLSearchParams(buildQueryString(search.data)).forEach((value, key) => query.set(key, value));

    const response = await fetch(process.env.API_URL + `logs/errors?${query}`, {
      headers: {
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': formData.get('location')?.toString() ?? ''
      },
      cache: 'no-store'
    });
    const result = await response.json();
    if (!response.ok) return { error: true, message: result.message || 'Error log list retrieval failed.' };
    return { error: false, message: '', data: result.data.logs, pager: result.data.pager };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Error log list retrieval failed.' };
  }
}