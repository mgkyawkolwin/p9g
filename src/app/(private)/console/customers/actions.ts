'use server';

import { redirect } from 'next/navigation';
import { customerValidator, pagerValidator, searchSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';

export async function customerGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/customers > customerGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );

    const message = '';

    //form data is blank, get the list by default pager
    // if (!formData || !(formData instanceof FormData)){
    //   c.i("formData is invalid. Retrieve list by default pager.");
    //   //retrieve users
    //   const response = await fetch(process.env.API_URL + `customers`, {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'cookie': (await headers()).get('cookie')
    //     }
    //   });

    //   //fail
    //   if(!response.ok){
    //     c.i("List retrieval failed. Return error.");
    //     return {error:true, message : "Customer list retrieval failed."};
    //   }
        
    //   //success
    //   const responseData = await response.json();
    //   c.d(JSON.stringify(responseData));

    //   //retrieve data from tuple
    //   const [users, pager] = responseData.data;
    //   return {error:false, message : "", data: users, pager: pager};
    // }
    

    // formData is valid, further process
    let queryString = null;

    //validate and parse paging input
    c.i("Parsing pager fields from form entries.");
    const pagerFields = pagerValidator.safeParse(formObject);
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
    const searchFields = searchSchema.safeParse(formObject);
    c.d(searchFields);

    //table pager field validatd, build query string
    if(searchFields.success){
      c.i("Search fields validation successful. Building query string.");
      queryString = queryString ? queryString + '&' + buildQueryString(searchFields.data) : buildQueryString(searchFields.data);
      c.d(queryString);
    }

    // const formObj = Object.fromEntries(formData.entries());
    // if(formObj.action && formObj.action == "UPDATE")
    // {
    //   c.i("Table action is UPDATE");
    //   //validate and parse form input
    //   c.i("Validating update fields.");
    //   const validatedFields = customerValidator.safeParse(formObject);
    //   c.d(validatedFields);

    //   //form validation fail
    //   if (!validatedFields.success) {
    //     c.i("Update fields validation failed. Return response.");
    //     return { error: true, message: 'Invalid inputs.', data: null, formData: null};
    //   }

    //   //form validation pass
    //   const { id, ...updatefields } = validatedFields.data;

    //   //update user
    //   c.i("Update fields validation successful. Requesting API to update.");
    //   const response = await fetch(process.env.API_URL + `customers/${id}`, {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'cookie': (await headers()).get('cookie')
    //     },
    //     body: JSON.stringify(updatefields),
    //   });
      
    //   //update user failed
    //   if (!response.ok) {
    //     c.i("Update api response failed. Return response.");
    //     const errorData = await response.json();
    //     c.e(errorData.message);
    //     return { error: true, message: `Failed to update customer. ${errorData.message}`, data: null, formData: null};
    //   }
    //   message = 'Customer updated';
    // }

    //retrieve users
    const response = await fetch(process.env.API_URL + `customers?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Updated list retrieval failed. Return response.");
      return {error:true, message : `Customer list retrieval failed. ${responseData.message}`};
    }

    //success
    c.i("Updated list retrieval successful.");
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    c.i("Everything is alright. Return response.");
    const [users, pager] = responseData.data;
    return {error:false, message : message, data: users, pager: pager};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Customer list retrieval failed."};
  }
}


export async function customerUpdate(formState : FormState, formData: FormData) : Promise<FormState>{
  try {
    c.i('Actions > /console/customers > customerUpdate');
    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );

    //validate and parse form input
    const validatedFields = customerValidator.safeParse(formObject);
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
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify({ name }),
    });

    const responseData = await response.json();
    
    //update user failed
    if (!response.ok) {
      return { error: true, message: `Failed to update customer. ${responseData.message}`, data: null, formData: null};
    }

    //update user success
    return {error: false, message:"Customer update successful", data: responseData, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update customer.', data: null, formData: null};
  }
}