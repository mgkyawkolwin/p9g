'use server';
import { User } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { customerUpdateSchema, pagerSchema, searchSchema, userUpdateSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import { signOut } from "@/app/auth";
import consoleLogger from "@/lib/core/logger/ConsoleLogger";
import { buildTableQueryString } from "@/lib/utils";

export async function customerGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    consoleLogger.logInfo('Actions > /console/customers > customerGetList');
    consoleLogger.logDebug(Object.fromEntries(formData?.entries()));

    //workaround for auto form submission at page load
    if (!formData || !(formData instanceof FormData))
      return {error:false, message : ""};

    if(!formData?.entries)
      return {error:false, message : ""};

    let queryString = null;

    //validate and parse table input
    const pagerFields = pagerSchema.safeParse(Object.fromEntries(formData.entries()));
    consoleLogger.logDebug(JSON.stringify(pagerFields));

    //table pager field validatd, build query string
    if(pagerFields.success){
      queryString = buildTableQueryString(pagerFields.data);
      consoleLogger.logDebug(queryString);
    }
    //validate and parse search input
    const searchFields = searchSchema.safeParse(Object.fromEntries(formData.entries()));
    consoleLogger.logDebug(JSON.stringify(searchFields));

    //table pager field validatd, build query string
    if(searchFields.success){
      queryString = queryString ? queryString + '&' + buildTableQueryString(searchFields.data) : buildTableQueryString(searchFields.data);
      consoleLogger.logDebug(queryString);
    }

    const formObj = Object.fromEntries(formData.entries());
    if(formObj.action && formObj.action == "UPDATE")
    {
      //validate and parse form input
      const validatedFields = customerUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
      consoleLogger.logDebug(validatedFields);

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
        consoleLogger.logError(errorData.message);
        return { error: true, message: 'Failed to update customer.', data: null, formData: null};
      }
    }

    //retrieve users
    const response = await fetch(process.env.API_URL + `customers?${queryString}`, {
      method: 'GET',
    });

    //fail
    if(!response.ok)
      return {error:true, message : "Customer list retrieval failed."};

    //success
    const responseData = await response.json();
    consoleLogger.logDebug(JSON.stringify(responseData));

    //retrieve data from tuple
    const [users, pager] = responseData.data;
    return {error:false, message : "", data: users, pager: pager};
  }catch(error){
    consoleLogger.logError(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Customer list retrieval failed."};
  }
}


export async function customerUpdate(formState : FormState, formData: FormData) : Promise<FormState>{
  try {
    consoleLogger.logInfo('Actions > /console/customers > customerUpdate');

    //validate and parse form input
    const validatedFields = customerUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    consoleLogger.logDebug(validatedFields);

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
      consoleLogger.logError(errorData.message);
      return { error: true, message: 'Failed to update customer.', data: null, formData: null};
    }

    //update user success
    const data = await response.json();
    //return {error: false, message:"", data: data, formData: null};
  } catch (error) {
    consoleLogger.logError(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update customer.', data: null, formData: null};
  }
  //if your come this far, everything seems good, redirect to update the list
  redirect('/console/customers');
}