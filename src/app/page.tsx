'use server';

import {auth} from "@/app/auth";
import { AppUrl } from "@/core/constants";
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();
    if(session)
      redirect('/MIDA/console/reservations');
    else
      redirect(AppUrl.signin);
}