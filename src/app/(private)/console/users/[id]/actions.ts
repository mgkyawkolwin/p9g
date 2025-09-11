'use server';

import { userUpdateSchema } from '@/core/validators/zodschema';
import c from "@/core/loggers/console/ConsoleLogger";
import { FormState } from "@/core/lib/types";
import { HttpStatusCode } from "@/core/lib/constants";
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
    if(response.status == HttpStatusCode.NotFound){
      return {error: true, message: "User not found.", data: null, formData: null};
    }
    if(response.status == HttpStatusCode.ServerError){
      return {error: true, message: "Internal server error.", data: null, formData: null};
    }
    if(!response.ok){
      c.d(JSON.stringify(await response.json()));
      return {error: true, message: "Failed to retrieve user.", data: null, formData: null};
    }
      
    //user retrieval success
    const responseData = await response.json();
    c.fe('Actions > userGet');
    return {error:false, message : "", data: responseData.data, formData: null};
  }catch(error){
    c.e(String(error));
    return {error: true, message: "Failed to retrieve user.", data: null, formData: null};
  }
}


export async function userUpdate(formState : FormState, formData: FormData) : Promise<FormState>{
  try {
    c.fs('Actions > userUpdate');

    //validate and parse form input
    const validatedFields = userUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    
    //form validation fail
    if (!validatedFields.success) {
      c.e(JSON.stringify(validatedFields.error.flatten().fieldErrors));
      return { error: true, message: 'Invalid inputs.', data: null, formData: null};
    }

    //form validation pass
    const { id, userName, email, password } = validatedFields.data;

    //update user
    const response = await fetch(process.env.API_URL + `users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify({ userName, email, password }),
    });
    
    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      c.e(errorData.message);
      return { error: true, message: 'Failed to update user.', data: null, formData: null};
    }

    //update user success
    const data = await response.json();

    c.fe('Actions > userUpdate');
    return {error: false, message:"", data: data, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update user.', data: null, formData: null};
  }
}