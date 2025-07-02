'use server';
import { User } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { pagerSchema, searchSchema, userUpdateSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import { signOut } from "@/app/auth";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";

export async function userGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /admin/users > userGetAll');
    c.d(JSON.stringify(formData.entries()));

    let queryString = null;

    //validate and parse table input
    const pagerFields = pagerSchema.safeParse(Object.fromEntries(formData.entries()));
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
    });

    //fail
    if(!response.ok)
      return {error:true, message : "User list retrieval failed."};

    //success
    const responseData = await response.json();
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    const [users, pager] = responseData.data;
    return {error:false, message : "", data: users, pager: pager};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "User list retrieval failed."};
  }
}


export async function userUpdate(formState : FormState, formData: FormData) : Promise<FormState>{
  try {
    c.i('Actions > /admin/users/[id]/edit > userUpdate');

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
    return {error: false, message:"", data: data, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update user.', data: null, formData: null};
  }
}