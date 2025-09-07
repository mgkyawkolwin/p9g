'use server';

import { customerValidator } from '@/core/validation/zodschema';
import { FormState } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import Customer from '@/core/domain/models/Customer';
import { headers } from 'next/headers';


export async function customerUpdate(customer: Customer) : Promise<FormState>{
  try {
    c.fs('Actions > customerUpdate');
    c.d(customer);

    //validate and parse form input
    const validatedFields = await customerValidator.safeParseAsync(customer);
    c.d(validatedFields);

    //form validation fail
    if (!validatedFields.success) {
      c.d(validatedFields.error.flatten().fieldErrors);
      return { error: true, message: 'Invalid inputs.', data: null, formData: null};
    }

    //update user
    const response = await fetch(process.env.API_URL + `customers/${customer.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify(validatedFields.data),
    });

    const responseData = await response.json();
    
    //update user failed
    if (!response.ok) {
      c.e(responseData.message);
      return { error: true, message: `Failed to update customer. ${responseData.message}`};
    }

    //update user success
    c.fe('Actions > customerUpdate');
    return {error: false, message:"Customer update successful", data: responseData.data, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update customer.', data: null, formData: null};
  }
}