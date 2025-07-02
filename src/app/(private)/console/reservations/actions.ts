'use server';
import { User } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { pagerSchema, searchSchema, userUpdateSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import { signOut } from "@/app/auth";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";

export async function xxxnewReservationAction(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/reservations/new > newReservationAction');
    c.d(JSON.stringify(formData.entries()));

    let queryString = null;

    //define default pageer fields for new reservation list
    const pager = {orderBy: "createdAt", orderDirection: "desc", pageIndex: 1, pageSize: 10};
    queryString = buildQueryString(pager);
    c.d(queryString);

    
    //retrieve latest 10 reservations
    const response = await fetch(process.env.API_URL + `reservations?${queryString}`, {
      method: 'GET',
    });

    //fail
    if(!response.ok)
      return {error:true, message : "Reservation list retrieval failed."};

    //success
    const responseData = await response.json();
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    const [reservations] = responseData.data;
    return {error:false, message : "", data: {reservations: reservations}};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "User list retrieval failed."};
  }
}
