'use server';

import { redirect } from 'next/navigation';
import { customerValidator } from '@/core/validators/zodschema';
import { FormState } from "@/core/lib/types";
import c from "@/core/loggers/console/ConsoleLogger";
import Customer from '@/core/domain/models/Customer';
import { headers } from 'next/headers';


export async function customerCreate(customer: Customer) : Promise<FormState>{
  try {
    c.fs('Actions > customerCreate');
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
    const response = await fetch(process.env.API_URL + `customers`, {
      method: 'POST',
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
      return { error: true, message: `Failed to create customer. ${responseData.message}`};
    }

    c.fe('Actions > customerCreate');
    return {error: false, message:"Customer create successful", data: responseData.data, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to create customer.', data: null, formData: null};
  }
}