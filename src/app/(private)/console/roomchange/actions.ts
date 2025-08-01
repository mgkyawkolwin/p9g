'use server';
import { searchSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';


export async function roomReservationGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/checkin > roomReservationGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );
    const message = '';

    // formData is valid, further process
    let queryString = null;

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
    const response = await fetch(process.env.API_URL + `roomreservation?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Room reservation list retrieval failed. Return response.");
      return {error:true, message : `Room reservation list retrieval failed. ${responseData.message}`};
    }

    //success
    c.i("Room reservation list retrieval successful.");
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    c.i("Everything is alright. Return response.");
    const roomReservations = responseData.data;
    return {error:false, message : message, data: roomReservations, pager: undefined};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Reservation list retrieval failed."};
  }
}


export async function moveRoom(id: string, roomNo:string){
  try{
    c.i('Action > roomchange > moveRoom');
    const response = await fetch(process.env.API_URL + `roomreservation?id=${id}&roomNo=${roomNo}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Room move failed. Return response.");
      return {error:true, message : `Room move failed. ${responseData.message}`};
    }

    c.i('Return > moveRoom');
    return {error:false, message:'Room moved.'};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Room move failed."};
  }
}