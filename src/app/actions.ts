'use server';
import { redirect } from 'next/navigation';
import { signOut } from "@/app/auth";
import c from '@/lib/loggers/console/ConsoleLogger';
import { FormState, TYPES } from '@/core/types';
import { AppUrl } from '@/core/constants';
import { container } from '@/core/di/dicontainer';
import ICacheAdapter from '@/lib/cache/ICacheAdapter';

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

export async function clearCache() : Promise<void> {
  const cache = container.get<ICacheAdapter>(TYPES.ICacheAdapter);
  cache.clear();
}