'use server';
import { UserEntity } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { customerValidator, pagerSchema, searchSchema, userUpdateSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import { signOut } from "@/app/auth";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";

export async function roomScheduleGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/roomschedule > roomScheduleGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(formData?.entries());

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
    });

    //fail
    if(!response.ok){
      c.i("Room schedule list retrieval failed. Return response.");
      return {error:true, message : "Room schedule list retrieval failed."};
    }

    //success
    c.i("Room schedule list retrieval successful.");
    const responseData = await response.json();
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

