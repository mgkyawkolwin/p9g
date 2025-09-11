'use server';

import {  pagerValidator, searchSchema } from '@/core/validators/zodschema';
import { FormState } from "@/core/lib/types";
import c from "@/core/loggers/console/ConsoleLogger";
import { buildQueryString } from "@/core/lib/utils";
import { headers } from 'next/headers';

export async function reservationGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.fs('Actions > reservationGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );
    const message = '';

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

    //retrieve users
    c.i("Update successful. Get the updated list based on query string.");
    const response = await fetch(process.env.API_URL + `reservations?${queryString}&list=checkout`, {
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
      return {error:true, message : `Reservation list retrieval failed. ${responseData.message}`};
    }

    //success
    c.i("Updated list retrieval successful.");
    c.d(responseData.data?.reservations?.length);
    c.d(responseData.data?.reservations?.length > 0 ? responseData.data.reservations[0] : []);

    //retrieve data from tuple
    c.fe('Actions > reservationGetList');
    const [reservations, pager] = responseData.data;
    return {error:false, message : message, data: reservations, pager: pager};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Reservation list retrieval failed."};
  }
}


export async function reservationCheckOut(id:string): Promise<FormState> {
    c.fs('Action > reservationCheckOut');
    const response = await fetch(process.env.API_URL + `reservations/${id}/checkout`, {
      method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'cookie': (await headers()).get('cookie')
            }
    });

    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Check out failed. Return response.");
      return {error:true, message : `Check out reservation failed. ${responseData.message}`};
    }

    c.fe('Action > reservationCheckOut');
    return {error: false, message:'Check out reservation successful.'};
}

