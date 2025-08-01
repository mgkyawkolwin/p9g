'use server';
import { reservationValidator } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import { headers } from 'next/headers';

export async function editReservationAction(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/reservations/[id] > editReservationAction');
    c.d(Object.fromEntries(formData.entries()));

    let queryString = '';
    const message = "";

    c.i("Finding form action for further processing.");
    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );
    const { id } = formObject;

    //first retrieve reservation to edit
    const getReservationResponse = await fetch(process.env.API_URL + `reservations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
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
    const pager = {orderBy: "createdAtUTC", orderDirection: "desc", pageIndex: 1, pageSize: 10, pages: 0, records: 0};
    queryString = buildQueryString(pager);
    c.d(queryString);
    
    c.i("Request api to retrieve latest 10 reservations");
    const response = await fetch(process.env.API_URL + `reservations?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Reservaton retrieval failed. Return response.");
      return {error:true, message : `Reservation list retrieval failed. ${responseData.message}`};
    }
      
    c.i("Reservation retrieval success.");
    c.d(responseData);

    //retrieve data from tuple
    const [reservations] = responseData.data;
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


export async function getReservation(reservationId:string){
    c.i("Action is SEARCH. Validating search fields.");

    //update user
    c.i("Requesting API to retrieve customers.");
    const response = await fetch(process.env.API_URL + `reservations/${reservationId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();
    
    //retrieve user failed
    if (!response.ok) {
      c.i("Retrieve reservation api response failed. Return response.");
      c.e(responseData.message);
      return { error: true, message: `Failed to retrieve reservation. ${responseData.message}`};
    }

    c.i("Retrieve reservation successful.");
    c.d(responseData);
    const reservation = responseData.data;
    
    return {error:false, data:reservation};
}


export async function searchCustomer(search:string){
    c.i("Action is SEARCH. Validating search fields.");

    //update user
    c.i("Requesting API to retrieve customers.");
    const response = await fetch(process.env.API_URL + `customers?searchName=${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();
    
    //retrieve user failed
    if (!response.ok) {
      c.i("Retrieve customers api response failed. Return response.");
      c.e(responseData.message);
      return { error: true, message: `Failed to retrieve customer. ${responseData.message}`, data: null, formData: null};
    }

    c.i("Retrieve users successful.");
    c.d(responseData);
    const [customers] = responseData.data;
    
    return {error:false, data:customers};
}


export async function updateReservationAction(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/reservations/[id]/edit > updateReservationAction');
    c.d(Object.fromEntries(formData.entries()));

    c.i("Finding form action for further processing.");
    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );
    const { id } = formObject;

    c.i("Action is SAVE. Validating input fields.");
    const reservationFields = reservationValidator.safeParse(formObject);
    c.d(reservationFields);

    if (!reservationFields.success) {
      c.i("Reservation fields validation failed. Return response.");
      return { error: true, message: 'Invalid inputs.', data: null, formData: null};
    }

    //update user
    c.i("Requesting API to update reservation.");
    const response = await fetch(process.env.API_URL + `reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify(reservationFields.data)
    });
    const responseData = await response.json();
    
    //retrieve user failed
    if (!response.ok) {
      c.i("Upate reservation api response failed. Return response.");
      c.e(responseData.message);
      return { error: true, message: `Failed to update reservation. ${responseData.message}`, data: null, formData: null};
    }

    c.i("Update reservation successful.");
    const reservation = responseData.data;
    c.d(reservation);

    c.i("Returning final response.");
    const successresponse = {error:false, message : 'Update reservation successful.', reload: true};
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}
