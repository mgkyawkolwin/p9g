'use server';

import Link from 'next/link';

import MainMenu from './mainmenu';
import SignOutButton from '@/lib/components/web/react/uicustom/signoutbutton';
import { signOutAction } from '@/app/actions';

export async function Header({ location, userName }: { location: string, userName: string }) {
  return (
    <header className="flex flex-col flex-1 max-h-[70px] border-t-[#0066aa] border-t-2 justify-between bg-[#333333] p-2">
      <div className="flex justify-between">
        <Link href="/">
          <span className="ml-2 text-base !text-xl font-bold text-white whitespace-nowrap">CONSOLE ({location}) </span>
        </Link>
        <div className='flex gap-x-4'>
          <span className='text-white'>{userName}</span>
          <SignOutButton action={signOutAction} />
        </div>
      </div>
      <div className="pl-2">
        <MainMenu  />
      </div>
    </header>
  );
}