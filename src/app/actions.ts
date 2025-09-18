'use server';
import { redirect } from 'next/navigation';
import { signOut } from "@/app/auth";
import c from '@/lib/loggers/console/ConsoleLogger';
import { FormState } from '@/core/types';
import { AppUrl } from '@/core/constants';

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