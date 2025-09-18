'use server';

import { userUpdateSchema } from '@/core/validators/zodschema';
import c from "@/lib/loggers/console/ConsoleLogger";
import { FormState } from "@/lib/types";
import { headers } from 'next/headers';

export async function userGet(id : number): Promise<FormState> {
  try{
    c.fs('Actions > userGet');

    //retrieve user
    const response = await fetch(process.env.API_URL + `users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    //user retrieval fail
    if(!response.ok)
      return {error: true, message: "Failed to retrieve user.", data: null, formData:null};

    //user retrieval success
    const responseData = await response.json();
    c.fe('Actions > userGet');
    return {error:false, message : "", data: responseData.data, formData:null};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: "Failed to retrieve user.", data: null, formData:null};
  }
}


export async function userUpdate(formState : FormState, formData: FormData) : Promise<FormState>{
  try {
    c.fs('Actions > userUpdate');
    c.d(JSON.stringify(formData.entries));

    //validate and parse form input
    const validatedFields = userUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    
    //form validation fail
    if (!validatedFields.success) {
      c.e(JSON.stringify(validatedFields.error.flatten().fieldErrors));
      return { error: true, message: 'Invalid inputs.', data: null, formData:null};
    }

    //form validation pass
    const { id, email, userName } = validatedFields.data;

    //update user
    const response = await fetch(process.env.API_URL + `users/${id}`, {
      method: 'PUT',
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
      return { error: true, message: 'Failed to update user.', data: null, formData:null};
    }

    //update user success
    const data = await response.json();
    c.fe('Actions > userUpdate');
    return {error: false, message:"User updated.", data: data, formData:null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update user.', data: null, formData:null};
  }
}