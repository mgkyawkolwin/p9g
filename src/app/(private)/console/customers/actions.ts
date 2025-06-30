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

    //form data is blank, get the list by default pager
    if (!formData || !(formData instanceof FormData)){
      consoleLogger.logInfo("formData is invalid. Retrieve list by default pager.");
      //retrieve users
      const response = await fetch(process.env.API_URL + `customers`, {
        method: 'GET',
      });

      //fail
      if(!response.ok){
        consoleLogger.logInfo("List retrieval failed. Return error.");
        return {error:true, message : "Customer list retrieval failed."};
      }
        
      //success
      const responseData = await response.json();
      consoleLogger.logDebug(JSON.stringify(responseData));

      //retrieve data from tuple
      const [users, pager] = responseData.data;
      return {error:false, message : "", data: users, pager: pager};
    }
    

    // formData is valid, further process
    let queryString = null;

    //validate and parse paging input
    consoleLogger.logInfo("Parsing pager fields from from entries.");
    const pagerFields = pagerSchema.safeParse(Object.fromEntries(formData.entries()));
    consoleLogger.logDebug(pagerFields);

    //table pager field validatd, build query string
    if(pagerFields.success){
      consoleLogger.logInfo("Pager fields validation successful. Build query string.");
      queryString = buildTableQueryString(pagerFields.data);
      consoleLogger.logDebug(queryString);
    }else{
      consoleLogger.logInfo("Pager fields validation failed.");
      
    }

    //validate and parse search input
    consoleLogger.logInfo("Parsing search fields from from entries.");
    const searchFields = searchSchema.safeParse(Object.fromEntries(formData.entries()));
    consoleLogger.logDebug(searchFields);

    //table pager field validatd, build query string
    if(searchFields.success){
      consoleLogger.logInfo("Search fields validation successful. Building query string.");
      queryString = queryString ? queryString + '&' + buildTableQueryString(searchFields.data) : buildTableQueryString(searchFields.data);
      consoleLogger.logDebug(queryString);
    }

    //detect table action
    consoleLogger.logInfo("Detecting table action.");
    const formObj = Object.fromEntries(formData.entries());
    if(formObj.action && formObj.action == "UPDATE")
    {
      consoleLogger.logInfo("Table action is UPDATE");
      //validate and parse form input
      consoleLogger.logInfo("Validating update fields.");
      const validatedFields = customerUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
      consoleLogger.logDebug(validatedFields);

      //form validation fail
      if (!validatedFields.success) {
        consoleLogger.logInfo("Update fields validation failed. Return response.");
        return { error: true, message: 'Invalid inputs.', data: null, formData: null};
      }

      //form validation pass
      const { id, ...updatefields } = validatedFields.data;

      //update user
      consoleLogger.logInfo("Update fields validation successful. Requesting API to update.");
      const response = await fetch(process.env.API_URL + `customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatefields),
      });
      
      //update user failed
      if (!response.ok) {
        consoleLogger.logInfo("Update api response failed. Return response.");
        const errorData = await response.json();
        consoleLogger.logError(errorData.message);
        return { error: true, message: 'Failed to update customer.', data: null, formData: null};
      }
    }

    //retrieve users
    consoleLogger.logInfo("Update successful. Get the updated list based on query string.");
    const response = await fetch(process.env.API_URL + `customers?${queryString}`, {
      method: 'GET',
    });

    //fail
    if(!response.ok){
      consoleLogger.logInfo("Updated list retrieval failed. Return response.");
      return {error:true, message : "Customer list retrieval failed."};
    }

    //success
    consoleLogger.logInfo("Updated list retrieval successful.");
    const responseData = await response.json();
    consoleLogger.logDebug(JSON.stringify(responseData));

    //retrieve data from tuple
    consoleLogger.logInfo("Everything is alright. Return response.");
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