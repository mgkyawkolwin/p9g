'use server';

import { FormState } from '@/core/types';
import { pagerValidator, searchValidator } from '@/core/validators/zodschema';
import c from '@/lib/loggers/console/ConsoleLogger';
import { buildQueryString } from '@/lib/utils';
import { headers } from 'next/headers';

export async function roomChargeLogGetList(formState: FormState, formData: FormData): Promise<FormState> {
  try {
    c.fs('Actions > roomChargeLogGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([, value]) => value !== 'DEFAULT' && value !== '')
    );

    let queryString = null;

    c.i('Parsing pager fields from form entries.');
    const pagerFields = pagerValidator.safeParse(formObject);
    c.d(pagerFields);

    if (pagerFields.success) {
      c.i('Pager fields validation successful. Build query string.');
      queryString = buildQueryString(pagerFields.data);
      c.d(queryString);
    } else {
      c.i('Pager fields validation failed.');
    }

    c.i('Parsing search fields from form entries.');
    const searchFields = searchValidator.safeParse(formObject);
    c.d(searchFields);

    if (searchFields.success) {
      c.i('Search fields validation successful. Building query string.');
      queryString = queryString ? queryString + '&' + buildQueryString(searchFields.data) : buildQueryString(searchFields.data);
      c.d(queryString);
    }

    const response = await fetch(process.env.API_URL + `logs/roomcharges?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': formData.get('location')?.toString() ?? ''
      },
      cache: 'no-store'
    });

    const responseData = await response.json();
    c.d(responseData);

    if (!response.ok) {
      return { error: true, message: responseData.message || 'Room charge log list retrieval failed.' };
    }

    return { error: false, message: '', data: responseData.data?.logs ?? [], pager: responseData.data?.pager };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const message = error instanceof Error ? error.message : 'Unknown error occured.';
    return { error: true, message };
  }
}
