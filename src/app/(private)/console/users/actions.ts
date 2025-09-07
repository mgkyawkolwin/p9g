'use server';

import { pagerValidator, searchSchema, userUpdateSchema } from '@/core/validation/zodschema';
import { FormState } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import { buildQueryString } from "@/core/lib/utils";
import { headers } from 'next/headers';

export async function userGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.fs('Actions > userGetList');
    c.d(JSON.stringify(formData.entries()));

    let queryString = null;

    //validate and parse table input
    const pagerFields = pagerValidator.safeParse(Object.fromEntries(formData.entries()));
    c.d(JSON.stringify(pagerFields));

    //table pager field validatd, build query string
    if(pagerFields.success){
      queryString = buildQueryString(pagerFields.data);
      c.d(queryString);
    }
    //validate and parse search input
    const searchFields = searchSchema.safeParse(Object.fromEntries(formData.entries()));
    c.d(JSON.stringify(searchFields));

    //table pager field validatd, build query string
    if(searchFields.success){
      queryString = queryString ? queryString + '&' + buildQueryString(searchFields.data) : buildQueryString(searchFields.data);
      c.d(queryString);
    }
    //retrieve users
    const response = await fetch(process.env.API_URL + `users?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    //fail
    if(!response.ok)
      return {error:true, message : "User list retrieval failed."};

    //success
    const responseData = await response.json();
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    const [users, pager] = responseData.data;
    c.fe('Actions > userGetList');
    return {error:false, message : "", data: users, pager: pager};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "User list retrieval failed."};
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
    const { id, email } = validatedFields.data;

    //update user
    const response = await fetch(process.env.API_URL + `users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify({ email }),
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