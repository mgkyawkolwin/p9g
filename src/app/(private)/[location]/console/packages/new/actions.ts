'use server';

import { prepaidPackageValidator } from '@/core/validators/zodschema';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';
import PrepaidPackage from '@/core/models/domain/PrepaidPackage';
import Config from '@/core/models/domain/Config';


export async function prepaidPackageCreate(prepaidPackage: PrepaidPackage, location: string): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackageCreate');
    c.d(prepaidPackage);

    const validatedFields = await prepaidPackageValidator.safeParseAsync(prepaidPackage);
    if (!validatedFields.success) {
      c.d(validatedFields.error.flatten().fieldErrors);
      return { error: true, message: 'Invalid inputs.', data: null, formData: null };
    }

    const response = await fetch(process.env.API_URL + `packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      },
      body: JSON.stringify(validatedFields.data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      c.e(responseData.message);
      return { error: true, message: `Failed to create package. ${responseData.message}` };
    }

    c.fe('Actions > prepaidPackageCreate');
    return { error: false, message: 'Package create successful', data: responseData.data, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to create package.', data: null, formData: null };
  }
}


export async function searchCustomer(search: string, location: string): Promise<FormState> {
  try {
    c.fs('Actions > searchCustomer (packages)');

    const response = await fetch(process.env.API_URL + `customers?searchName=${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      }
    });

    const responseData = await response.json();
    if (!response.ok) {
      c.e(responseData.message);
      return { error: true, message: `Failed to retrieve customer. ${responseData.message}`, data: null, formData: null };
    }

    c.fe('Actions > searchCustomer (packages)');
    return { error: false, message: '', data: responseData.data.customers };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to retrieve customer.', data: null, formData: null };
  }
}


export async function prepaidPackageTypeGetList(location: string): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackageTypeGetList');

    const response = await fetch(process.env.API_URL + `packages/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      }
    });

    const responseData = await response.json();
    if (!response.ok) {
      c.e(responseData.message);
      return { error: true, message: `Failed to retrieve package types. ${responseData.message}`, data: null, formData: null };
    }

    const packageTypes: Config[] = (responseData.data ?? []) as Config[];
    c.fe('Actions > prepaidPackageTypeGetList');
    return { error: false, message: '', data: packageTypes };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to retrieve package types.', data: null, formData: null };
  }
}
