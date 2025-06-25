'use server';

import {auth} from "@/app/auth";
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();
    if(session)
      redirect('/console/users');
    else
      redirect('/auth/signin');
}