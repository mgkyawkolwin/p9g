'use server';
import { searchSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';

export async function roomScheduleGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/roomschedule > roomScheduleGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );

    c.i('Validating search fields.');
    const validatedSearchFields = await searchSchema.safeParseAsync(formObject);

    if(!validatedSearchFields.success){
      c.i('Search fields validation failed. Return response.');
      return {error:true, message : "Search fields validation failed."};
    }

    c.i('Search fields validation successful. Build query string.')
    const queryString = buildQueryString(validatedSearchFields.data);
    c.d(queryString);

    //retrieve room schedule
    c.i("Retrieve room schedules.");
    const response = await fetch(process.env.API_URL + `roomschedules?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Room schedule list retrieval failed. Return response.");
      return {error:true, message : `Room schedule list retrieval failed. ${responseData.message}`};
    }

    //success
    c.i("Room schedule list retrieval successful.");
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    c.i("Everything is alright. Return response.");
    const rooms = responseData.data;
    return {error:false, message : '', data: {rooms: rooms, date: formObject.searchCheckInDateUTCTo}};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Room schedule list retrieval failed."};
  }
}

