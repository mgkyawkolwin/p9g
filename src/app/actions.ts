'use server';
import { redirect } from 'next/navigation';
import { signOut } from "@/app/auth";
import c from '@/core/loggers/console/ConsoleLogger';
import { FormState } from '@/core/lib/types';
import { AppUrl } from '@/core/lib/constants';

export async function signOutAction() : Promise<FormState>{
  c.i("Action > singOutAction");
  try{
    await signOut();
  }catch(error){
    c.d(error instanceof Error ? error.message : JSON.stringify(error));
  }
  c.i("Redirecting ...");
  return redirect(AppUrl.signin);
}