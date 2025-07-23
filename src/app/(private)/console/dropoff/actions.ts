'use server';

import { pagerValidator, searchSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';

export async function reservationGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/pickup > reservationGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(formData?.entries());
    const message = '';

    // formData is valid, further process
    let queryString = null;

    //validate and parse paging input
    c.i("Parsing pager fields from form entries.");
    const pagerFields = pagerValidator.safeParse(Object.fromEntries(formData.entries()));
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
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
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


export async function updateDropOffCarNo(id:string, carNo:string) : Promise<FormState>{
  c.i('Action > updateDropOffCarNo');
  c.d(id);
  c.d(carNo);
    const response = await fetch(process.env.API_URL + `reservations/${id}/dropoff`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify({carNo: carNo})
    });

    //fail
    if(!response.ok){
      c.i("Car no update failed. Return response.");
      return {error:true, message : "Car number update failed."};
    }

    return {error: false, message:'Car number update successful.'};
}

