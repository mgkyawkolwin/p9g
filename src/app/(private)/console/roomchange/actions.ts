'use server';
import { searchValidator } from '@/core/validators/zodschema';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';


export async function roomReservationGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.fs('Actions > roomReservationGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );
    const message = '';

    // formData is valid, further process
    let queryString = null;

    //validate and parse search input
    c.i("Parsing search fields from from entries.");
    const searchFields = searchValidator.safeParse(formObject);
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
    c.d(responseData.data?.roomReservations?.length);
    c.d(responseData.data?.roomReservations?.length > 0 ? responseData.data.roomReservations[0] : []);

    //retrieve data from tuple
    c.fe('Actions > roomReservationGetList');
    const roomReservations = responseData.data;
    return {error:false, message : message, data: roomReservations, pager: undefined};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Reservation list retrieval failed."};
  }
}


export async function moveRoom(id: string, roomNo:string, moveDate: Date){
  try{
    c.fs('Action > moveRoom');
    const response = await fetch(process.env.API_URL + `roomreservation?id=${id}&roomNo=${roomNo}&date=${moveDate.toISOString()}`, {
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

    c.fe('Action > moveRoom');
    return {error:false, message:'Room moved.'};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Room move failed."};
  }
}