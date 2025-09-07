'use server';
import {  reservationValidator} from '@/core/validation/zodschema';
import { FormState } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import { buildQueryString } from "@/core/lib/utils";
import { headers } from 'next/headers';
import Reservation from '@/core/domain/models/Reservation';

export async function getTopReservationsAction(): Promise<FormState> {
  try{
    c.fs('Actions > getTopReservationsAction');

    let queryString = null;
    const message = "";

    c.i("Retrieving latest reservation list.")
    //define default pageer fields for new reservation list
    const pager = {orderBy: "createdAtUTC", orderDirection: "desc", pageIndex: 1, pageSize: 10};
    queryString = buildQueryString(pager);
    c.d(queryString);
    
    c.i("Request api to retrieve latest 10 reservations");
    const response = await fetch(process.env.API_URL + `reservations?${queryString}&list=top`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });
    const responseData = await response.json();

    //fail
    if(!response.ok){
      c.i("Reservation retrieval failed. Return response.");
      return {error:true, message : `Reservation list retrieval failed. ${responseData.message}`};
    }
      
    c.i("Reservation retrieval success.");
    //c.d(reservationData);

    //retrieve data from tuple
    const [reservations] = responseData.data;
    c.d(reservations?.length);

    c.fe('Actions > getTopReservationsAction');
    const successresponse = {error:false, message : message, data: {reservations: reservations}};
    //c.d(successresponse);
    return successresponse;
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Unknown error occured."};
  }
}


export async function saveReservationAction(reservation: Reservation): Promise<FormState> {
    try{
      c.fs("Action > saveReservationAction");
      c.d(JSON.stringify(reservation));

      const validatedReservation = await reservationValidator.safeParseAsync(reservation);
      if(!validatedReservation.success){
        c.d(validatedReservation.error.flatten())
        return { error: true, message: `Failed to create reservation. Invalid inputs.`};
      }

      //update user
      c.i("Requesting API to creaate reservation.");
      const response = await fetch(process.env.API_URL + `reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cookie': (await headers()).get('cookie')
        },
        //credentials: 'include',
        body: JSON.stringify(reservation)
      });
      const responseData = await response.json();
      
      //retrieve user failed
      if (!response.ok) {
        c.i("Create reservation api response failed. Return response.");
        c.e(responseData.message);
        return { error: true, message: `Failed to create reservation. ${responseData.message}`};
      }

      
      //const reservation = responseData.data;
      //c.d(reservation);
      c.fe("Action > saveReservationAction");
      return {error:false, message:'Save reservation successful.', reload:true};
    }catch(error){
      c.e(error instanceof Error ? error.message : String(error));
      return {error:true, message:'Save reservation failed.', reload:true};
    }
}


export async function searchCustomer(search:string){
    c.fs("Action > searchCustomer");

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
    
    c.fe("Action > searchCustomer");
    return {error:false, data:customers};
}
