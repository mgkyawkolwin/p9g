'use server';

import { prepaidPackageValidator } from '@/core/validators/zodschema';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';
import PrepaidPackage from '@/core/models/domain/PrepaidPackage';
import PrepaidEntity from '@/core/models/entity/PrepaidEntity';


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


export async function prepaidPackageUpdate(prepaidPackage: PrepaidPackage, location: string): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackageUpdate');
    c.d(prepaidPackage);

    const validatedFields = await prepaidPackageValidator.safeParseAsync(prepaidPackage);
    if (!validatedFields.success) {
      c.d(validatedFields.error.flatten().fieldErrors);
      return { error: true, message: 'Invalid inputs.', data: null, formData: null };
    }

    const response = await fetch(process.env.API_URL + `packages/${prepaidPackage.id}`, {
      method: 'PUT',
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
      return { error: true, message: `Failed to update package. ${responseData.message}` };
    }

    c.fe('Actions > prepaidPackageUpdate');
    return { error: false, message: 'Package update successful', data: responseData.data, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to update package.', data: null, formData: null };
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

    const packageTypes: PrepaidEntity[] = (responseData.data ?? []) as PrepaidEntity[];
    c.fe('Actions > prepaidPackageTypeGetList');
    return { error: false, message: '', data: packageTypes };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to retrieve package types.', data: null, formData: null };
  }
}


export async function prepaidPackagePaymentGetList(id: string, location: string): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackagePaymentGetList');

    const response = await fetch(process.env.API_URL + `packages/${encodeURIComponent(id)}/payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      }
    });

    const responseData = await response.json();
    if (!response.ok) {
      return { error: true, message: `Failed to retrieve package payments. ${responseData.message}`, data: null };
    }

    c.fe('Actions > prepaidPackagePaymentGetList');
    return { error: false, message: '', data: responseData.data.payments };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to retrieve package payments.', data: null };
  }
}


export async function prepaidPackagePaymentCreate(
  id: string,
  payment: { amount: number; paymentDateTimeUTC: Date | string; currency: string; paymentMode: string; remark?: string | null },
  location: string
): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackagePaymentCreate');

    const paymentPayload = {
      amount: Number(payment.amount),
      paymentDateTimeUTC: payment.paymentDateTimeUTC instanceof Date
        ? payment.paymentDateTimeUTC.toISOString()
        : payment.paymentDateTimeUTC,
      currency: String(payment.currency ?? ''),
      paymentMode: String(payment.paymentMode ?? 'CASH'),
      remark: String(payment.remark ?? '')
    };

    const response = await fetch(process.env.API_URL + `packages/${encodeURIComponent(id)}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      },
      body: JSON.stringify(paymentPayload)
    });

    const responseData = await response.json();
    if (!response.ok) {
      return { error: true, message: `Failed to save package payment. ${responseData.message}`, data: null };
    }

    c.fe('Actions > prepaidPackagePaymentCreate');
    return { error: false, message: 'Package payment saved.', data: responseData.data.payment };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to save package payment.', data: null };
  }
}


export async function prepaidPackagePaymentUpdate(
  id: string,
  paymentId: string,
  payment: { amount: number; paymentDateTimeUTC: Date | string; currency: string; paymentMode: string; remark?: string | null },
  location: string
): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackagePaymentUpdate');

    const paymentPayload = {
      amount: Number(payment.amount),
      paymentDateTimeUTC: payment.paymentDateTimeUTC instanceof Date
        ? payment.paymentDateTimeUTC.toISOString()
        : payment.paymentDateTimeUTC,
      currency: String(payment.currency ?? ''),
      paymentMode: String(payment.paymentMode ?? 'CASH'),
      remark: String(payment.remark ?? '')
    };

    const response = await fetch(process.env.API_URL + `packages/${encodeURIComponent(id)}/payments/${encodeURIComponent(paymentId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      },
      body: JSON.stringify(paymentPayload)
    });

    const responseData = await response.json();
    if (!response.ok) {
      return { error: true, message: `Failed to update package payment. ${responseData.message}`, data: null };
    }

    c.fe('Actions > prepaidPackagePaymentUpdate');
    return { error: false, message: 'Package payment updated.', data: responseData.data.payment };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to update package payment.', data: null };
  }
}


export async function prepaidPackagePaymentDelete(id: string, paymentId: string, location: string): Promise<FormState> {
  try {
    c.fs('Actions > prepaidPackagePaymentDelete');

    const response = await fetch(process.env.API_URL + `packages/${encodeURIComponent(id)}/payments/${encodeURIComponent(paymentId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': location
      }
    });

    const responseData = await response.json();
    if (!response.ok) {
      return { error: true, message: `Failed to delete package payment. ${responseData.message}`, data: null };
    }

    c.fe('Actions > prepaidPackagePaymentDelete');
    return { error: false, message: 'Package payment deleted.', data: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to delete package payment.', data: null };
  }
}
