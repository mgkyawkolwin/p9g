'use server';
import { searchValidator } from '@/core/validators/zodschema';
import { FormState } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';

export async function roomScheduleGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.fs('Actions > roomScheduleGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );

    c.i('Validating search fields.');
    const validatedSearchFields = await searchValidator.safeParseAsync(formObject);

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
    c.d(responseData.data?.length);
    c.d(responseData.data?.length > 0 ? responseData.data[0] : []);

    //retrieve data from tuple
    c.fe('Actions > roomScheduleGetList');
    const rooms = responseData.data;
    return {error:false, message : '', data: {rooms: rooms, date: formObject.searchCheckInDateUntil}};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Room schedule list retrieval failed."};
  }
}

