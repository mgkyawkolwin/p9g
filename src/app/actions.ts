'use server';
import { redirect } from 'next/navigation';
import { signOut } from "@/app/auth";
import consoleLogger from '@/lib/core/logger/ConsoleLogger';
import { FormState } from '@/lib/types';
import { AppUrl } from '@/lib/constants';

export async function signOutAction() : Promise<FormState>{
  consoleLogger.logInfo("Action > singOutAction");
  try{
    await signOut();
  }catch(error){
    consoleLogger.logDebug(error instanceof Error ? error.message : JSON.stringify(error));
  }
  consoleLogger.logInfo("Redirecting ...");
  return redirect(AppUrl.signin);
}