'use server';
import {  reservationValidator} from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";

export async function newReservationAction(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i("----------------------------------------------------------");
    c.i('Actions > /console/reservations/new > newReservationAction');
    c.d(Object.fromEntries(formData.entries()));

    let queryString = null;
    //let customers = [];
    const message = "";

    c.i("Finding form action for further processing.");
    const formObj = Object.fromEntries(formData.entries());
    c.d(formObj);

    c.i("Retrieving latest reservation list.")
    //define default pageer fields for new reservation list
    const pager = {orderBy: "createdAtUTC", orderDirection: "desc", pageIndex: 1, pageSize: 10};
    queryString = buildQueryString(pager);
    c.d(queryString);
    
    c.i("Request api to retrieve latest 10 reservations");
    const reservationResponse = await fetch(process.env.API_URL + `reservations?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
          'Pragma': 'no-cache', //for old browsers
          'Cache-Control': 'no-cache', // Forces caches to revalidate with the server
          //'Cache-Control': 'no-store' 
      }
    });

    //fail
    if(!reservationResponse.ok){
      c.i("Reservation retrieval failed. Return response.");
      return {error:true, message : "Reservation list retrieval failed."};
    }
      
    c.i("Reservation retrieval success.");
    const reservationData = await reservationResponse.json();
    c.d(reservationData);

    //retrieve data from tuple
    const [reservations] = reservationData.data;
    c.d(reservations?.length);

    c.i("Returning final response.");
    const successresponse = {error:false, message : message, data: {reservations: reservations}};
    //c.d(successresponse);
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}


export async function saveReservation(formState : FormState, formData: FormData): Promise<FormState> {
    c.i("Action is SAVE. Validating search fields.");
    const formObject = Object.fromEntries(formData.entries());
    const reservationFields = reservationValidator.safeParse(formObject);
    c.d(reservationFields);

    if (!reservationFields.success) {
      c.i("Reservation fields validation failed. Return response.");
      return { error: true, message: 'Invalid inputs.', data: null, formData: null};
    }

    //update user
    c.i("Requesting API to creaate reservation.");
    const reservationResponse = await fetch(process.env.API_URL + `reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationFields.data)
    });
    
    //retrieve user failed
    if (!reservationResponse.ok) {
      c.i("Create reservation api response failed. Return response.");
      const errorData = await reservationResponse.json();
      c.e(errorData.message);
      return { error: true, message: 'Failed to create reservation.', data: null, formData: null};
    }

    c.i("Create reservation successful.");
    const reservationData = await reservationResponse.json();
    const reservation = reservationData.data;
    c.d(reservation);

    return {error:false, message:'Save reservation successful.', reload:true};
}


export async function searchCustomer(search:string){
    c.i("Action is SEARCH. Validating search fields.");

    //update user
    c.i("Requesting API to retrieve customers.");
    const customersResponse = await fetch(process.env.API_URL + `customers?searchName=${search}`, {
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
    const responseData = await customersResponse.json();
    c.d(responseData);
    const [customers] = responseData.data;
    
    return {error:false, data:customers};
}
