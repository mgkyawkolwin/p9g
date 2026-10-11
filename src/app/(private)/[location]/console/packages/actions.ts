'use server';

import { pagerValidator } from '@/core/validators/zodschema';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';


export async function prepaidPackageGetList(formState: FormState, formData: FormData): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackageGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT'));
    if (!formObject.pageIndex && formObject.pageIndexx) {
      formObject.pageIndex = formObject.pageIndexx;
    }
    if (!formObject.pageSize && formObject.pageSizex) {
      formObject.pageSize = formObject.pageSizex;
    }
    const pagerFields = pagerValidator.safeParse(formObject);

    let queryString = '';
    if (pagerFields.success) {
      queryString = buildQueryString(pagerFields.data);
    }

    const response = await fetch(process.env.API_URL + `packages?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': formData.get('location') as string ?? ''
      }
    });

    const responseData = await response.json();
    if (!response.ok) {
      return { error: true, message: `Package list retrieval failed. ${responseData.message}` };
    }

    c.fe('Actions > prepaidPackageGetList');
    return { error: false, message: '', data: responseData.data.packages, pager: responseData.data.pager };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Package list retrieval failed.' };
  }
}