'use server';

import Link from 'next/link';
import MainMenu from './mainmenu';
import SignOutButton from '@/lib/components/web/react/uicustom/signoutbutton';
import { signOutAction } from '@/app/actions';

export async function Header({ location, userName }: { location: string, userName: string }) {
  const headerBgColor = location === 'MIDA' ? 'bg-[#d5ac0d] dark:bg-[#d5ac0d]' : 'bg-[#00aa00] dark:bg-[#00aa00]';
  return (
    <>
      <div className="h-[70px]" style={{ display: 'none' }}></div>
      
      <header 
        className={`top-0 z-40 sticky relative w-full flex flex-col flex-1 max-h-[70px] border-t-[#0066aa] border-t-4 justify-between ${headerBgColor} p-2`}
        
      >
        <div className="flex justify-between">
          <Link href="/">
            <span className="ml-2 text-base !text-xl font-bold whitespace-nowrap">
              CONSOLE ({location})
            </span>
          </Link>
          <div className='flex gap-x-4'>
            <span className='text-white'>{userName}</span>
            <SignOutButton action={signOutAction} />
          </div>
        </div>
        <div className="pl-2 bg-yellow">
          <MainMenu />
        </div>
      </header>
    </>
  );
}