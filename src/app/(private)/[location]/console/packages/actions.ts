'use server';

import { pagerValidator, searchValidator } from '@/core/validators/zodschema';
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
    const searchFields = searchValidator.safeParse(formObject);

    let queryString = '';
    if (pagerFields.success) {
      queryString = buildQueryString(pagerFields.data);
    }
    if (searchFields.success) {
      const searchQuery = buildQueryString(searchFields.data);
      queryString = queryString ? `${queryString}&${searchQuery}` : searchQuery;
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


export async function prepaidPackageUsageGetList(id: string, pageIndex: number, pageSize: number, location: string): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackageUsageGetList');

    const queryString = buildQueryString({ pageIndex, pageSize });
    const response = await fetch(process.env.API_URL + `packages/${encodeURIComponent(id)}/history?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      }
    });

    const responseData = await response.json();
    if (!response.ok) {
      return { error: true, message: `Package history retrieval failed. ${responseData.message}` };
    }

    c.fe('Actions > prepaidPackageUsageGetList');
    return { error: false, message: '', data: responseData.data.usages, pager: responseData.data.pager };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Package history retrieval failed.' };
  }
}


export async function prepaidPackageUsageGetListAction(formState: FormState, formData: FormData): Promise<FormState> {
  return prepaidPackageUsageGetList(
    String(formData.get('id') ?? ''),
    Number(formData.get('pageIndex') ?? 1),
    Number(formData.get('pageSize') ?? 10),
    String(formData.get('location') ?? '')
  );
}


export async function prepaidPackageCustomerSummaryGet(id: string, location: string): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackageCustomerSummaryGet');

    const response = await fetch(process.env.API_URL + `packages/${encodeURIComponent(id)}/customer-summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      }
    });

    const responseData = await response.json();
    if (!response.ok) {
      return { error: true, message: `Customer summary retrieval failed. ${responseData.message}`, data: null };
    }

    c.fe('Actions > prepaidPackageCustomerSummaryGet');
    return { error: false, message: '', data: responseData.data.summaries };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Customer summary retrieval failed.', data: null };
  }
}