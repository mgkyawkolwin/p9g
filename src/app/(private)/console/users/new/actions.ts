'use server';

import { redirect } from 'next/navigation';
import { userCreateSchema } from '@/core/validators/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { headers } from 'next/headers';


export async function userNew(formState : FormState, formData: FormData) : Promise<FormState>{
  try {
    c.fs('Actions > userNew');
    c.d(JSON.stringify(formData.entries));

    //validate and parse form input
    const validatedFields = userCreateSchema.safeParse(Object.fromEntries(formData.entries()));
    
    //form validation fail
    if (!validatedFields.success) {
      c.e(JSON.stringify(validatedFields.error.flatten().fieldErrors));
      return { error: true, message: 'Invalid inputs.', data: null, formData:null};
    }

    //form validation pass
    const { email, userName } = validatedFields.data;

    //update user
    const response = await fetch(process.env.API_URL + `users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify({ userName, email }),
    });
    
    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      c.e(errorData.message);
      return { error: true, message: 'Failed to create user.', data: null, formData:null};
    }

    c.fe('Actions > userNew');
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update user.', data: null, formData:null};
  }
  //if we come this far, everything is alright, redirect to user list
  redirect('/admin/users');
}