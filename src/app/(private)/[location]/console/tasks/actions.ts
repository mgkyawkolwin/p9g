'use server';

import { pagerValidator, taskSearchValidator } from '@/core/validators/zodschema';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';

export async function taskGetList(formState: FormState, formData: FormData): Promise<FormState> {
  try {
    c.fs('Actions > taskGetList');

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );

    const pagerFields = pagerValidator.safeParse(formObject);
    let queryString = pagerFields.success ? buildQueryString(pagerFields.data) : '';

    const searchFields = taskSearchValidator.safeParse(formObject);
    if (searchFields.success) {
      const search = new URLSearchParams(
        Object.entries(searchFields.data).filter(([, v]) => v !== undefined && v !== '') as [string, string][]
      ).toString();
      if (search) queryString = queryString ? `${queryString}&${search}` : search;
    }

    const response = await fetch(process.env.API_URL + `tasks?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': formData.get('location')?.toString() ?? ''
      }
    });
    const responseData = await response.json();

    if (!response.ok) {
      return { error: true, message: `Task list retrieval failed. ${responseData.message}` };
    }

    c.fe('Actions > taskGetList');
    return { error: false, message: '', data: responseData.data.tasks, pager: responseData.data.pager };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: "Task list retrieval failed." };
  }
}
