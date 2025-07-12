'use server';
import { UserEntity } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { pagerSchema, reservationValidator, searchSchema, userUpdateSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import { signOut } from "@/app/auth";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";

export async function editReservationAction(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/reservations/[id] > editReservationAction');
    c.d(Object.fromEntries(formData.entries()));

    let queryString = null;
    let message = "";

    c.i("Finding form action for further processing.");
    const formObj = Object.fromEntries(formData.entries());
    const { id } = formObj;

    //first retrieve reservation to edit
    const getReservationResponse = await fetch(process.env.API_URL + `reservations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    //retrieve user failed
    if (!getReservationResponse.ok) {
      c.i("Retrieve reservation api response failed. Return response.");
      const errorData = await getReservationResponse.json();
      c.e(errorData.message);
      return { error: true, message: 'Failed to retrieve reservation.', data: null, formData: null};
    }

    c.i("Retrieve reservation successful.");
    const reservationData = await getReservationResponse.json();
    const reservation = reservationData.data;
    c.d(reservation);


    c.i("Retrieving latest reservation list.");
    //define default pageer fields for new reservation list
    const pager = {orderBy: "createdAtUTC", orderDirection: "desc", pageIndex: 1, pageSize: 10};
    queryString = buildQueryString(pager);
    c.d(queryString);
    
    c.i("Request api to retrieve latest 10 reservations");
    const getReservationsResponse = await fetch(process.env.API_URL + `reservations?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
          'Pragma': 'no-cache', //for old browsers
          'Cache-Control': 'no-cache', // Forces caches to revalidate with the server
          //'Cache-Control': 'no-store' 
      }
    });

    //fail
    if(!getReservationsResponse.ok){
      c.i("Reservaton retrieval failed. Return response.");
      return {error:true, message : "Reservation list retrieval failed."};
    }
      
    c.i("Reservation retrieval success.");
    const reservationsData = await getReservationsResponse.json();
    c.d(reservationsData);

    //retrieve data from tuple
    const [reservations] = reservationsData.data;
    c.d(reservations?.length);

    c.i("Returning final response.");
    const successresponse = {error:false, message : message, data: {reservation: reservation, reservations: reservations}};
    //c.d(successresponse);
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
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
    const [customers, pager] = responseData.data;
    
    return {error:false, data:customers};
}


export async function updateReservationAction(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/reservations/[id]/edit > updateReservationAction');
    c.d(Object.fromEntries(formData.entries()));

    let queryString = null;
    let customers = [];
    let message = "";

    c.i("Finding form action for further processing.");
    const formObj = Object.fromEntries(formData.entries());
    const { id } = formObj;

    c.i("Action is SAVE. Validating input fields.");
    const reservationFields = reservationValidator.safeParse(formObj);
    c.d(reservationFields);

    if (!reservationFields.success) {
      c.i("Reservation fields validation failed. Return response.");
      return { error: true, message: 'Invalid inputs.', data: null, formData: null};
    }

    //update user
    c.i("Requesting API to update reservation.");
    const reservationResponse = await fetch(process.env.API_URL + `reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationFields.data)
    });
    
    //retrieve user failed
    if (!reservationResponse.ok) {
      c.i("Upate reservation api response failed. Return response.");
      const errorData = await reservationResponse.json();
      c.e(errorData.message);
      return { error: true, message: 'Failed to update reservation.', data: null, formData: null};
    }

    c.i("Update reservation successful.");
    const reservationData = await reservationResponse.json();
    const reservation = reservationData.data;
    c.d(reservation);

    c.i("Returning final response.");
    const successresponse = {error:false, message : 'Update reservation successful.', reload: true};
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}
