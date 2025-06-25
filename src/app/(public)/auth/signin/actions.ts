'use server';
import { redirect } from 'next/navigation';
import { signIn } from "@/app/auth";
import consoleLogger from '@/lib/core/logger/ConsoleLogger';
import { AppUrl } from '@/lib/constants';


export async function signInAction(state : {error:boolean, message:string}, formData:FormData){
    try {
        consoleLogger.logInfo("singInAction");
        consoleLogger.logDebug(JSON.stringify(formData));
        //retreive 
        const formObject = Object.fromEntries(formData.entries());
        const { userName, password } = formObject;

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
            return {error: true,  message : "Invalid username and password.", formData: formData};

        //credential check successful
        const user = await response.json();

        // valid credentials, sign the user in
        await signIn('credentials',  {redirect : false, userName:user.userName, role: user.role});
    } catch (error) {
        consoleLogger.logError(error instanceof Error ? error.message : String(error));
        return {error: true,  message: "Unknown error.", formData: formData};
    }
    //if we come this far, we are ok with sign in process, safely redirect now
    redirect(AppUrl.main);
}