'use server';
import { User } from "@/data/orm/drizzle/mysql/schema"
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { userCreateSchema } from '@/lib/zodschema';
import { APIResponse, FormState } from "@/lib/types";
import consoleLogger from "@/lib/core/logger/ConsoleLogger";


export async function userCreate(formState : FormState, formData: FormData) : Promise<FormState>{
  try {
    consoleLogger.logInfo('Actions > /admin/users/new > userCreate');
    consoleLogger.logDebug(JSON.stringify(formData.entries));

    //validate and parse form input
    const validatedFields = userCreateSchema.safeParse(Object.fromEntries(formData.entries()));
    
    //form validation fail
    if (!validatedFields.success) {
      consoleLogger.logError(JSON.stringify(validatedFields.error.flatten().fieldErrors));
      return { error: true, message: 'Invalid inputs.', data: null, formData:null};
    }

    //form validation pass
    const { email, userName } = validatedFields.data;

    //update user
    const response = await fetch(process.env.API_URL + `users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, email }),
    });
    
    //update user failed
    if (!response.ok) {
      const errorData = await response.json();
      consoleLogger.logError(errorData.message);
      return { error: true, message: 'Failed to create user.', data: null, formData:null};
    }

  } catch (error) {
    consoleLogger.logError(error instanceof Error ? error.message : String(error));
    return {error: true, message: 'Failed to update user.', data: null, formData:null};
  }
  //if we come this far, everything is alright, redirect to user list
  redirect('/admin/users');
}