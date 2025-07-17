'use server';

import { redirect } from 'next/navigation';
import { customerValidator } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import Customer from '@/domain/models/Customer';


export async function customerCreate(customer: Customer) : Promise<FormState>{
  try {
    c.i('Actions > /console/customers/new/ > customerCreate');
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
      },
      body: JSON.stringify(validatedFields.data),
    });
    
    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      c.e(errorData.message);
      return { error: true, message: 'Failed to create customer.', data: null, formData: null};
    }

    //update user success
    const result = await response.json();
    return {error: false, message:"Customer create successful", data: result.data, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to create customer.', data: null, formData: null};
  }
}