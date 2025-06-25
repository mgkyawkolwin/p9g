'use client';

import Link from 'next/link';
import SignOutButton from '../uicustom/signoutbutton';
import {signOutAction} from '@/app/actions';

export function MainMenu() {

  return (
    <div className='flex gap-x-4 items-center'>
      <Link
        href="/"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        Users
      </Link>
      <SignOutButton action={signOutAction}/>
    </div>
  );
}
