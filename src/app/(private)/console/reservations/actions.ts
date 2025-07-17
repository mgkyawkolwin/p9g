'use server';
import { billValidator, pagerSchema, searchSchema } from '@/lib/zodschema';
import { FormState } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { buildQueryString } from "@/lib/utils";
import Bill from '@/domain/models/Bill';

export async function reservationGetList(formState : FormState, formData: FormData): Promise<FormState> {
  try{
    c.i('Actions > /console/reservation > reservationGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(formData?.entries());
    
    if(formObject.actionVerb === 'CANCEL'){
      c.i('Action is CANCEL');
      const response = await fetch(process.env.API_URL + `reservations/${formObject.cancelId}?operation=CANCEL`, {
        method: 'PATCH',
      });
  
      //fail
      if(!response.ok){
        c.i("Cancel failed. Return response.");
        return {error:true, message : "Cancel reservation failed."};
      }
    }

    // formData is valid, further process
    let queryString = null;

    //validate and parse paging input
    c.i("Parsing pager fields from form entries.");
    const pagerFields = pagerSchema.safeParse(Object.fromEntries(formData.entries()));
    c.d(pagerFields);

    //table pager field validatd, build query string
    if(pagerFields.success){
      c.i("Pager fields validation successful. Build query string.");
      queryString = buildQueryString(pagerFields.data);
      c.d(queryString);
    }else{
      c.i("Pager fields validation failed.");
      
    }

    //validate and parse search input
    c.i("Parsing search fields from from entries.");
    const searchFields = searchSchema.safeParse(Object.fromEntries(formData.entries()));
    c.d(searchFields);

    //table pager field validatd, build query string
    if(searchFields.success){
      c.i("Search fields validation successful. Building query string.");
      queryString = queryString ? queryString + '&' + buildQueryString(searchFields.data) : buildQueryString(searchFields.data);
      c.d(queryString);
    }

    //retrieve users
    c.i("Update successful. Get the updated list based on query string.");
    const response = await fetch(process.env.API_URL + `reservations?${queryString}`, {
      method: 'GET',
    });

    //fail
    if(!response.ok){
      c.i("Updated list retrieval failed. Return response.");
      return {error:true, message : "Reservation list retrieval failed."};
    }

    //success
    c.i("Updated list retrieval successful.");
    const responseData = await response.json();
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    c.i("Everything is alright. Return response.");
    const [reservations, pager] = responseData.data;
    return {error:false, message : "", data: reservations, pager: pager};
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return {error:true, message : "Reservation list retrieval failed."};
  }
}


export async function getBills(id:string) : Promise<FormState>{
  try {
    c.i('Actions > /console/reservations/ > getBills');
    c.d(id);

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/bills`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    //update user failed
    if (!response.ok) {
      c.e(result.message);
      return { error: true, message: `Failed to get bills. ${result.message}`, data: null, formData: null};
    }
    c.d(result.bills?.length);
    //update user success
    return {error: false, message:"", data: result.bills, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to add bills.', data: null, formData: null};
  }
}




export async function saveBills(id: string, bills: Bill[]) : Promise<FormState>{
  try {
    c.i('Actions > /console/reservations/ > saveBills');
    c.d(bills);

    //validate and parse form input
    bills.forEach(async (bill) => {
      const validatedFields = await billValidator.safeParseAsync(bill);
      c.d(validatedFields);

      //form validation fail
      if (!validatedFields.success) {
        c.d(validatedFields.error.flatten().fieldErrors);
        return { error: true, message: 'Invalid inputs.', data: null, formData: null};
      }
    });

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bills),
    });
    
    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      c.e(errorData.message);
      return { error: true, message: 'Failed to add bills.', data: null, formData: null};
    }

    //update user success
    const result = await response.json();
    return {error: false, message:"Bills updated.", data: result.data, formData: null};
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to add bills.', data: null, formData: null};
  }
}