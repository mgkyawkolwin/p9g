'use server';
import { redirect } from 'next/navigation';
import { signIn } from "@/app/auth";
import c from '@/lib/loggers/console/ConsoleLogger';
import { AppUrl } from '@/core/constants';
import { FormState } from '@/core/types';
import { userSignInSchema } from '@/core/validators/zodschema';


export async function signInAction(state : FormState, formData:FormData){
    //only the user name is retained for re-rendering the form, never the password
    const retainedFormData = new FormData();
    try {
        c.fs("singInAction");
        const userNameValue = formData.get("userName");
        if (typeof userNameValue === "string") retainedFormData.set("userName", userNameValue);

        //validate input (rejects non-string values and oversized input)
        const formObject = Object.fromEntries(formData.entries());
        const parsed = userSignInSchema.safeParse({ userName: formObject.userName, password: formObject.password });
        if (!parsed.success)
            return {error: true, message: "Invalid username and password.", formData: retainedFormData};

        const { userName, password } = parsed.data;

        //check credentials
        const response = await fetch(process.env.API_URL + `auth/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, password }),
          });
        //credential check failed, return response
        if(!response.ok)
            return {error: true, message: "Invalid username and password.", formData: retainedFormData};

        //credential check successful, the API issues a short-lived signed ticket
        const user = await response.json();

        // the auth provider only accepts the server-issued ticket, never raw identity fields
        c.fe("singInAction");
        await signIn('credentials', {redirect : false, ticket: user.ticket});
    } catch (error) {
        c.e(error instanceof Error ? error.message : String(error));
        return {error: true, message: "Unknown error.", formData: retainedFormData};
    }
    //if we come this far, we are ok with sign in process, safely redirect now
    redirect(`/MIDA${AppUrl.main}`);
}