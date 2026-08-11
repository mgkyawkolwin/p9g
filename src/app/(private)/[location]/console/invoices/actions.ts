'use server';
import { pagerValidator, searchValidator, invoiceValidator } from '@/core/validators/zodschema';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import Invoice from '@/core/models/domain/Invoice';
import { headers } from 'next/headers';

export async function invoiceGetList(formState: FormState, formData: FormData): Promise<FormState> {
  try {
    c.fs('Actions > invoiceGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );

    // formData is valid, further process
    let queryString = null;

    //validate and parse paging input
    c.i("Parsing pager fields from form entries.");
    const pagerFields = pagerValidator.safeParse(formObject);
    c.d(pagerFields);

    //table pager field validatd, build query string
    if (pagerFields.success) {
      c.i("Pager fields validation successful. Build query string.");
      queryString = buildQueryString(pagerFields.data);
      c.d(queryString);
    } else {
      c.i("Pager fields validation failed.");
    }

    //validate and parse search input
    c.i("Parsing search fields from from entries.");
    const searchFields = searchValidator.safeParse(formObject);
    c.d(searchFields);

    //table pager field validatd, build query string
    if (searchFields.success) {
      c.i("Search fields validation successful. Building query string.");
      queryString = queryString ? queryString + '&' + buildQueryString(searchFields.data) : buildQueryString(searchFields.data);
      c.d(queryString);
    }

    //retrieve invoices
    c.i("Get the invoice list based on query string.");
    const response = await fetch(process.env.API_URL + `invoices?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie') ?? '',
        'X-Resort-Location': formData.get('location') as string
      },
      credentials: 'include'
    });
    const responseData = await response.json();

    //fail
    if (!response.ok) {
      c.i("Invoice list retrieval failed. Return response.");
      return { error: true, message: `Invoice list retrieval failed. ${responseData.message}` };
    }

    //success
    c.i("Invoice list retrieval successful.");
    c.d(responseData.data?.invoices?.length);
    c.d(responseData.data?.invoices?.length > 0 ? responseData.data.invoices[0] : []);

    c.fe('Actions > invoiceGetList');
    return { error: false, message: "", data: responseData.data.invoices, pager: responseData.data.pager};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: "Invoice list retrieval failed." };
  }
}

export async function invoiceGetById(id: string, location: string): Promise<FormState> {
  try {
    c.fs('Actions > invoiceGetById');
    c.d(id);

    const response = await fetch(process.env.API_URL + `invoices/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie'),
        'X-Resort-Location': location
      },
      credentials: 'include'
    });

    const responseData = await response.json();

    if (!response.ok) {
      c.e(responseData.message);
      return { error: true, message: `Failed to get invoice. ${responseData.message}`, data: null };
    }

    c.d(responseData.data);
    c.fe('Actions > invoiceGetById');
    return { error: false, message: "", data: responseData.data };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to get invoice.', data: null };
  }
}

export async function invoiceUpdate(id: string, invoice: Invoice, location: string): Promise<FormState> {
  try {
    c.fs('Actions > invoiceUpdate');
    c.d(id);
    c.d(invoice);

    const response = await fetch(process.env.API_URL + `invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie'),
        'X-Resort-Location': location
      },
      body: JSON.stringify(invoice),
      credentials: 'include'
    });

    const responseData = await response.json();

    if (!response.ok) {
      c.e(responseData.message);
      return { error: true, message: `Failed to update invoice. ${responseData.message}` };
    }

    c.fe('Actions > invoiceUpdate');
    return { error: false, message: "Invoice updated successfully.", data: responseData.data };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to update invoice.' };
  }
}

export async function invoiceCreate(invoice: Invoice, location: string): Promise<FormState> {
  try {
    c.fs('Actions > invoiceCreate');
    c.d(invoice);

    const response = await fetch(process.env.API_URL + `invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie'),
        'X-Resort-Location': location
      },
      body: JSON.stringify(invoice),
      credentials: 'include'
    });

    const responseData = await response.json();

    if (!response.ok) {
      c.e(responseData.message);
      return { error: true, message: `Failed to create invoice. ${responseData.message}` };
    }

    c.fe('Actions > invoiceCreate');
    return { error: false, message: "Invoice created successfully.", data: responseData.data };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to create invoice.' };
  }
}

export async function invoiceDelete(id: string, location: string): Promise<FormState> {
  try {
    c.fs('Actions > invoiceDelete');
    c.d(id);

    const response = await fetch(process.env.API_URL + `invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie'),
        'X-Resort-Location': location
      },
      credentials: 'include'
    });

    const responseData = await response.json();

    if (!response.ok) {
      c.e(responseData.message);
      return { error: true, message: `Failed to delete invoice. ${responseData.message}` };
    }

    c.fe('Actions > invoiceDelete');
    return { error: false, message: 'Invoice deleted successfully.' };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to delete invoice.' };
  }
}
