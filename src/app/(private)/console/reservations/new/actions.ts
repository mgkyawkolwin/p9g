'use server';
import { User } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { pagerSchema, searchSchema, userUpdateSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import { signOut } from "@/app/auth";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";

export async function newReservationAction(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i("----------------------------------------------------------");
    c.i('Actions > /console/reservations/new > newReservationAction');
    c.d(JSON.stringify(formData.entries()));

    let queryString = null;
    let customers = [];

    c.i("Retrieving latest reservation list.")
    //define default pageer fields for new reservation list
    const pager = {orderBy: "createdAt", orderDirection: "desc", pageIndex: 1, pageSize: 10};
    queryString = buildQueryString(pager);
    c.d(queryString);
    
    c.i("Request api to retrieve latest 10 reservations");
    const reservationResponse = await fetch(process.env.API_URL + `reservations/top?${queryString}`, {
      method: 'GET',
    });

    //fail
    if(!reservationResponse.ok){
      c.i("Reservaton retrieval failed. Return response.");
      return {error:true, message : "Reservation list retrieval failed."};
    }
      
    c.i("Reservation retrieval success.");
    const reservationData = await reservationResponse.json();
    c.d(reservationData);

    //retrieve data from tuple
    const [reservations] = reservationData.data;
    c.d(reservations);

    c.i("Finding form action for further processing.");
    const formObj = Object.fromEntries(formData.entries());
    if(formObj.action && formObj.action == "SEARCH")
    {
      c.i("Action is SEARCH. Validating search fields.");
      const searchFields = searchSchema.safeParse(formObj);
      c.d(searchFields);

      if (!searchFields.success) {
        c.i("Search fields validation failed. Return response.");
        return { error: true, message: 'Invalid inputs.', data: null, formData: null};
      }

      c.i("Search field validation pass. Build query string.");
      queryString = buildQueryString(searchFields.data);
      c.d(queryString);

      //update user
      c.i("Requesting API to retrieve customers.");
      const customersResponse = await fetch(process.env.API_URL + `customers?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      //retrieve user failed
      if (!customersResponse.ok) {
        c.i("Retrieve customers api response failed. Return response.");
        const errorData = await customersResponse.json();
        c.e(errorData.message);
        return { error: true, message: 'Failed to retrieve customer.', data: null, formData: null};
      }

      c.i("Retrieve users successful.");
      const customersData = await customersResponse.json();
      [customers] = customersData.data;
      c.d(JSON.stringify(customers));
    }

    c.i("Returning final response.");
    const successresponse = {error:false, message : "", data: {reservations: reservations, customers: customers}};
    c.d(successresponse);
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}
