// app/components/layouts/header.tsx
'use server';

import Link from 'next/link';
import MainMenu from './mainmenu';
import SignOutButton from '@/lib/components/web/react/uicustom/signoutbutton';
import { signOutAction } from '@/app/actions';
import { TabSwitcher } from './tabswitcher';

interface HeaderProps {
  location: string;
  userName: string;
}

const RESORTS = {
  MIDA: { name: 'MIDA', bgClass: 'bg-yellow-500', menuBgClass: 'bg-yellow-500' },
  KKC: { name: 'KKC', bgClass: 'bg-green-500', menuBgClass: 'bg-green-500' },
  HH: { name: 'HH', bgClass: 'bg-blue-500', menuBgClass: 'bg-blue-500' }
};

export async function Header({ location, userName }: HeaderProps) {
  const currentResort = RESORTS[location as keyof typeof RESORTS] || RESORTS.MIDA;

  return (
    <header className="top-0 z-40 sticky w-full shadow-md">
      <div className="flex justify-between items-center px-4 py-0 bg-[#333333] text-white">
        <div className="flex items-center gap-8 text-white">
          <Link href="/" style={{ textDecoration: 'none', marginRight: '50px' }}>
            <span className="text-xl font-bold text-white whitespace-nowrap">
              CONSOLE
            </span>
          </Link>
          
          <TabSwitcher currentLocation={location} />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-white">{userName}</span>
          <SignOutButton action={signOutAction} />
        </div>
      </div>
      
      {/* Row 2: Menu with dynamic background - Force apply with inline style if needed */}
      <div className={`${currentResort.menuBgClass} w-full`} style={{ backgroundColor: currentResort.menuBgClass === 'bg-yellow-500' ? '#eab308' : currentResort.menuBgClass === 'bg-green-500' ? '#22c55e' : '#3b82f6' }}>
        <div className="px-4 py-2">
          <MainMenu />
        </div>
      </div>
    </header>
  );
}