'use server';
import { UserEntity } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { customerValidator, pagerSchema, searchSchema, userUpdateSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import { signOut } from "@/app/auth";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";

export async function customerGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/customers > customerGetList');
    c.d(Object.fromEntries(formData?.entries()));

    //form data is blank, get the list by default pager
    if (!formData || !(formData instanceof FormData)){
      c.i("formData is invalid. Retrieve list by default pager.");
      //retrieve users
      const response = await fetch(process.env.API_URL + `customers`, {
        method: 'GET',
      });

      //fail
      if(!response.ok){
        c.i("List retrieval failed. Return error.");
        return {error:true, message : "Customer list retrieval failed."};
      }
        
      //success
      const responseData = await response.json();
      c.d(JSON.stringify(responseData));

      //retrieve data from tuple
      const [users, pager] = responseData.data;
      return {error:false, message : "", data: users, pager: pager};
    }
    

    // formData is valid, further process
    let queryString = null;

    //validate and parse paging input
    c.i("Parsing pager fields from form entries.");
    const pagerFields = pagerSchema.safeParse(Object.fromEntries(formData.entries()));
    c.d(pagerFields);

    //table pager field validatd, build query string
    if(pagerFields.success){
      c.i("Pager fields validation successful. Build query string.");
      queryString = buildQueryString(pagerFields.data);
      c.d(queryString);
    }else{
      c.i("Pager fields validation failed.");
      
    }

    //validate and parse search input
    c.i("Parsing search fields from from entries.");
    const searchFields = searchSchema.safeParse(Object.fromEntries(formData.entries()));
    c.d(searchFields);

    //table pager field validatd, build query string
    if(searchFields.success){
      c.i("Search fields validation successful. Building query string.");
      queryString = queryString ? queryString + '&' + buildQueryString(searchFields.data) : buildQueryString(searchFields.data);
      c.d(queryString);
    }

    //detect table action
    c.i("Detecting table action.");
    const formObj = Object.fromEntries(formData.entries());
    if(formObj.action && formObj.action == "UPDATE")
    {
      c.i("Table action is UPDATE");
      //validate and parse form input
      c.i("Validating update fields.");
      const validatedFields = customerValidator.safeParse(Object.fromEntries(formData.entries()));
      c.d(validatedFields);

      //form validation fail
      if (!validatedFields.success) {
        c.i("Update fields validation failed. Return response.");
        return { error: true, message: 'Invalid inputs.', data: null, formData: null};
      }

      //form validation pass
      const { id, ...updatefields } = validatedFields.data;

      //update user
      c.i("Update fields validation successful. Requesting API to update.");
      const response = await fetch(process.env.API_URL + `customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatefields),
      });
      
      //update user failed
      if (!response.ok) {
        c.i("Update api response failed. Return response.");
        const errorData = await response.json();
        c.e(errorData.message);
        return { error: true, message: 'Failed to update customer.', data: null, formData: null};
      }
    }

    //retrieve users
    c.i("Update successful. Get the updated list based on query string.");
    const response = await fetch(process.env.API_URL + `customers?${queryString}`, {
      method: 'GET',
    });

    //fail
    if(!response.ok){
      c.i("Updated list retrieval failed. Return response.");
      return {error:true, message : "Customer list retrieval failed."};
    }

    //success
    c.i("Updated list retrieval successful.");
    const responseData = await response.json();
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    c.i("Everything is alright. Return response.");
    const [users, pager] = responseData.data;
    return {error:false, message : "", data: users, pager: pager};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Customer list retrieval failed."};
  }
}


export async function customerUpdate(formState : FormState, formData: FormData) : Promise<FormState>{
  try {
    c.i('Actions > /console/customers > customerUpdate');

    //validate and parse form input
    const validatedFields = customerValidator.safeParse(Object.fromEntries(formData.entries()));
    c.d(validatedFields);

    //form validation fail
    if (!validatedFields.success) {
      //consoleLogger.logError(JSON.stringify(validatedFields.error.flatten().fieldErrors));
      return { error: true, message: 'Invalid inputs.', data: null, formData: null};
    }

    //form validation pass
    const { id, name } = validatedFields.data;

    //update user
    const response = await fetch(process.env.API_URL + `customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      c.e(errorData.message);
      return { error: true, message: 'Failed to update customer.', data: null, formData: null};
    }

    //update user success
    const data = await response.json();
    //return {error: false, message:"", data: data, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update customer.', data: null, formData: null};
  }
  //if your come this far, everything seems good, redirect to update the list
  redirect('/console/customers');
}