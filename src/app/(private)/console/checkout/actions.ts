'use server';
import { User } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { customerValidator, pagerSchema, searchSchema, userUpdateSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import { signOut } from "@/app/auth";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";

export async function reservationGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/checkin > reservationGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const d = new Date('2025-01-01T23:59:59.000Z');
    c.d(d);
    c.d(d.toString());
    c.d(d.toDateString());
    c.d(d.toISOString());
    c.d(d.toUTCString());
    c.d(d.toLocaleString('sv-SE'));
    c.d(d.toLocaleDateString('sv-SE'));

    const formObject = Object.fromEntries(formData?.entries());
    let message = '';
    
    if(formObject.actionVerb === 'CANCEL'){
      c.i('Action is CANCEL');
      const response = await fetch(process.env.API_URL + `reservations/${formObject.cancelId}?operation=CANCEL`, {
        method: 'PATCH',
      });
  
      //fail
      if(!response.ok){
        c.i("Cancel failed. Return response.");
        return {error:true, message : "Cancel reservation failed."};
      }
      //update message
      message = 'Cancelling reservation successful.';
    }

    if(formObject.actionVerb === 'CHECKIN'){
      c.i('Action is CHECKIN');
      const response = await fetch(process.env.API_URL + `reservations/${formObject.checkInId}?operation=CHECKIN`, {
        method: 'PATCH',
      });
  
      //fail
      if(!response.ok){
        c.i("Checkin failed. Return response.");
        return {error:true, message : "Checkin reservation failed."};
      }
      //update message
      message = 'Checking in reservation successful.';
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

    //retrieve users
    c.i("Update successful. Get the updated list based on query string.");
    const response = await fetch(process.env.API_URL + `reservations?${queryString}`, {
      method: 'GET',
    });

    //fail
    if(!response.ok){
      c.i("Updated list retrieval failed. Return response.");
      return {error:true, message : "Reservation list retrieval failed."};
    }

    //success
    c.i("Updated list retrieval successful.");
    const responseData = await response.json();
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    c.i("Everything is alright. Return response.");
    const [reservations, pager] = responseData.data;
    return {error:false, message : message, data: reservations, pager: pager};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Reservation list retrieval failed."};
  }
}

