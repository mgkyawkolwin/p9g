'use server';
import { billValidator, pagerValidator, paymentValidator, roomChargeValidator, roomReservationValidator, searchSchema } from '@/core/validation/zodschema';
import { FormState } from "@/core/lib/types";
import c from "@/core/logger/console/ConsoleLogger";
import { buildQueryString } from "@/core/lib/utils";
import Bill from '@/core/domain/models/Bill';
import { headers } from 'next/headers';
import { auth } from '@/app/auth';
import Payment from '@/core/domain/models/Payment';
import RoomReservation from '@/core/domain/models/RoomReservation';
import RoomCharge from '@/core/domain/models/RoomCharge';

export async function reservationGetList(formState: FormState, formData: FormData): Promise<FormState> {
  try {
    c.fs('Actions > reservationGetList');
    c.d(Object.fromEntries(formData?.entries()));

    const formObject = Object.fromEntries(
      Array.from(formData?.entries()).filter(([key, value]) => value !== 'DEFAULT')
    );

    // formData is valid, further process
    let queryString = null;

    //validate and parse paging input
    c.i("Parsing pager fields from form entries.");
    const pagerFields = pagerValidator.safeParse(formObject);
    c.d(pagerFields);

    //table pager field validatd, build query string
    if (pagerFields.success) {
      c.i("Pager fields validation successful. Build query string.");
      queryString = buildQueryString(pagerFields.data);
      c.d(queryString);
    } else {
      c.i("Pager fields validation failed.");

    }

    //validate and parse search input
    c.i("Parsing search fields from from entries.");
    const searchFields = searchSchema.safeParse(formObject);
    c.d(searchFields);

    //table pager field validatd, build query string
    if (searchFields.success) {
      c.i("Search fields validation successful. Building query string.");
      queryString = queryString ? queryString + '&' + buildQueryString(searchFields.data) : buildQueryString(searchFields.data);
      c.d(queryString);
    }

    //retrieve users
    c.i("Update successful. Get the updated list based on query string.");
    const response = await fetch(process.env.API_URL + `reservations?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      credentials: 'include'
    });
    const responseData = await response.json();

    //fail
    if (!response.ok) {
      c.i("Updated list retrieval failed. Return response.");
      return { error: true, message: `Reservation list retrieval failed. ${responseData.message}` };
    }

    //success
    c.i("Updated list retrieval successful.");
    c.d(JSON.stringify(responseData));

    //retrieve data from tuple
    c.fe('Actions > reservationGetList');
    const [reservations, pager] = responseData.data;
    return { error: false, message: "", data: reservations, pager: pager };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: "Reservation list retrieval failed." };
  }
}


export async function billDelete(reservationId: string, billId: string): Promise<FormState> {
  try {
    c.fs('Actions > billDelete');
    c.d(reservationId);
    c.d(billId);

    //delete payment
    const response = await fetch(process.env.API_URL + `reservations/${reservationId}/bills/${billId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
    });

    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      c.e(errorData);
      return { error: true, message: 'Failed to delete bill. ' + errorData.message };
    }

    c.fe('Actions > billDelete');
    return { error: false, message: "Bill deleted." };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to delete bill.', data: null, formData: null };
  }
}


export async function billsGet(id: string): Promise<FormState> {
  try {
    c.fs('Actions > billsGet');
    c.d(id);

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/bills`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const result = await response.json();

    //update user failed
    if (!response.ok) {
      c.e(result.message);
      return { error: true, message: `Failed to get bills. ${result.message}`, data: null, formData: null };
    }
    c.d(result.bills);

    c.fe('Actions > billsGet');
    return { error: false, message: "", data: result.bills, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to add bills.', data: null, formData: null };
  }
}


export async function billsSave(id: string, bills: Bill[]): Promise<FormState> {
  try {
    c.fs('Actions > billsSave');
    c.d(bills);

    //validate and parse form input
    bills.forEach(async (bill) => {
      const validatedFields = await billValidator.safeParseAsync(bill);
      c.d(validatedFields);

      //form validation fail
      if (!validatedFields.success) {
        c.d(validatedFields.error.flatten().fieldErrors);
        return { error: true, message: 'Invalid inputs.', data: null, formData: null };
      }
    });

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify(bills),
    });

    const result = await response.json();
    c.e(result);

    //update bill failed
    if (!response.ok) {
      return { error: true, message: `Failed to save bills. ${result.message}`, data: null, formData: null };
    }

    c.fe('Actions > billsSave');
    return { error: false, message: "Bills updated.", data: result.data, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to add bills.', data: null, formData: null };
  }
}


export async function billsView(id: string): Promise<FormState> {
  try {
    c.fs('Actions > billsView');
    c.d(id);

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/invoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const result = await response.json();

    //update user failed
    if (!response.ok) {
      c.e(result.message);
      return { error: true, message: `Failed to get invoices. ${result.message}`, data: null, formData: null };
    }
    //update user success
    c.fe('Actions > billsView');
    return { error: false, message: "", data: result.invoice, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to get invoices.', data: null, formData: null };
  }
}


export async function paymentsGet(id: string): Promise<FormState> {
  try {
    c.fs('Actions > paymentsGet');
    c.d(id);

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const result = await response.json();

    //update user failed
    if (!response.ok) {
      c.e(result.message);
      return { error: true, message: `Failed to get bills. ${result.message}`, data: null, formData: null };
    }
    c.d(result.bills?.length);
    //update user success
    c.fe('Actions > paymentsGet');
    return { error: false, message: "", data: result.payments, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to add bills.', data: null, formData: null };
  }
}


export async function paymentsDelete(reservationId: string, paymentId: string): Promise<FormState> {
  try {
    c.fs('Actions > paymentsDelete');
    c.d(paymentId);

    //delete payment
    const response = await fetch(process.env.API_URL + `reservations/${reservationId}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
    });

    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      c.e(errorData);
      return { error: true, message: 'Failed to delete payments. ' + errorData.message };
    }

    c.fe('Actions > paymentsDelete');
    return { error: false, message: "Payments deleted." };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to delete payments.', data: null, formData: null };
  }
}


export async function paymentsSave(id: string, payments: Payment[]): Promise<FormState> {
  try {
    c.fs('Actions > paymentsSave');
    c.d(payments);

    //validate and parse form input
    payments.forEach(async (payment) => {
      const validatedFields = await paymentValidator.safeParseAsync(payment);
      c.d(validatedFields);

      //form validation fail
      if (!validatedFields.success) {
        c.d(validatedFields.error.flatten().fieldErrors);
        return { error: true, message: 'Invalid inputs.', data: null, formData: null };
      }
    });

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify(payments),
    });

    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      c.e(errorData);
      return { error: true, message: 'Failed to save payments.', data: null, formData: null };
    }

    //update user success
    const result = await response.json().then().catch((error) => {
      c.i('HAHAHA')
      c.d(error)
    });

    c.fe('Actions > paymentsSave');
    return { error: false, message: "Payments saved.", data: result.data, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to save payments.', data: null, formData: null };
  }
}


export async function paymentsView(id: string): Promise<FormState> {
  try {
    c.fs('Actions > paymentsView');
    c.d(id);

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/invoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const result = await response.json();

    //update user failed
    if (!response.ok) {
      c.e(result.message);
      return { error: true, message: `Failed to get invoices. ${result.message}`, data: null, formData: null };
    }
    //update user success
    c.fe('Actions > paymentsView');
    return { error: false, message: "", data: result.invoice, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to get invoices.', data: null, formData: null };
  }
}


export async function roomChargeGetListById(id: string): Promise<FormState> {
  try {
    c.fs('Actions > roomChargeGetListById');
    c.d(id);

    const response = await fetch(process.env.API_URL + `reservations/${id}/roomcharges`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const result = await response.json();

    if (!response.ok) {
      c.e(result.message);
      return { error: true, message: `Failed to get room charges. ${result.message}`, data: null, formData: null };
    }

    c.fe('Actions > roomChargeGetListById');
    return { error: false, message: "", data: result.roomCharges };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to get room charges.', data: null, formData: null };
  }
}


export async function roomChargeUpdateList(id: string, roomCharges: RoomCharge[]): Promise<FormState> {
  try {
    c.fs('Actions > roomChargeUpdateList');
    c.d(roomCharges);

    //validate and parse form input
    roomCharges.forEach(async (roomCharge) => {
      const validatedFields = await roomChargeValidator.safeParseAsync(roomCharge);
      c.d(validatedFields);

      //form validation fail
      if (!validatedFields.success) {
        c.d(validatedFields.error.flatten().fieldErrors);
        return { error: true, message: 'Invalid inputs.', data: null, formData: null };
      }
    });

    //update bills
    const response = await fetch(process.env.API_URL + `reservations/${id}/roomcharges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify(roomCharges),
    });

    const result = await response.json();

    //update user failed
    if (!response.ok) {
      return { error: true, message: 'Failed to save room charges.', data: null, formData: null };
    }

    c.fe('Actions > roomChargeUpdateList');
    return { error: false, message: "Room charges saved.", data: result.data, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: `Failed to save room charges. ${error instanceof Error ? error.message : ''}`, data: null, formData: null };
  }
}


export async function roomReservationGetListById(id: string): Promise<FormState> {
  try {
    c.fs('Actions > roomReservationGetListById');
    c.d(id);

    const response = await fetch(process.env.API_URL + `reservations/${id}/roomreservations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const result = await response.json();
    c.d(result.roomReservations);

    if (!response.ok) {
      c.e(result.message);
      return { error: true, message: `Failed to get room reservations. ${result.message}`, data: null, formData: null };
    }

    c.fe('Actions > roomReservationGetListById');
    return { error: false, message: "", data: result.roomReservations };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: 'Failed to get room reservations.', data: null, formData: null };
  }
}


export async function roomReservationUpdateList(id: string, roomReservations: RoomReservation[]): Promise<FormState> {
  try {
    c.fs('Actions > roomReservationUpdateList');
    c.d(roomReservations);

    c.i('Validate and parse form input.');
    roomReservations.forEach(async (roomReservation) => {
      const validatedFields = await roomReservationValidator.safeParseAsync(roomReservation);
      c.d(validatedFields);

      //form validation fail
      if (!validatedFields.success) {
        c.d(validatedFields.error.flatten().fieldErrors);
        return { error: true, message: 'Invalid inputs.', data: null, formData: null };
      }
    });

    c.i('Calling service to update room reservations.');
    const response = await fetch(process.env.API_URL + `reservations/${id}/roomreservations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      },
      body: JSON.stringify(roomReservations),
    });

    c.i('Service called. Processing response.');
    const result = await response.json();
    c.d(result.data);

    //update user failed
    if (!response.ok) {
      return { error: true, message: `Failed to save room reservations. ${result.message}`, data: null, formData: null };
    }

    c.fe('Actions > roomReservationUpdateList');
    return { error: false, message: "Room charges saved.", data: result.data, formData: null };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: `Failed to save room reservations. ${error instanceof Error ? error.message : ''}`, data: null, formData: null };
  }
}


export async function reservationCancel(id: string): Promise<FormState> {
  try {
    c.fs('Action > reservationCancel');
    const response = await fetch(process.env.API_URL + `reservations/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'cookie': (await headers()).get('cookie')
      }
    });

    const responseData = await response.json();

    //fail
    if (!response.ok) {
      c.i("Cancel failed. Return response.");
      return { error: true, message: `Cancel reservation failed. ${responseData.message}` };
    }

    c.fe('Action > reservationCancel');
    return { error: false, message: 'Cancel reservation successful.' };
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return { error: true, message: `Failed to cancel reservations. ${error instanceof Error ? error.message : ''}`, data: null, formData: null };
  }
}