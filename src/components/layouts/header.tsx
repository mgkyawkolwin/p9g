'use client';

import Link from 'next/link';

import {MainMenu} from './mainmenu';

export function Header() {
  return (
    <header className="flex flex-row flex-1 max-h-[50px] border-t-[#0066aa] border-t-2 justify-between bg-[#333333] p-2">
      <div className="w-[50px]">
        <Link href="/">
          <span className="ml-2 text-base !text-2xl font-bold text-white">CONSOLE</span>
        </Link>
      </div>
      <div className="">
          <MainMenu />
      </div>
    </header>
  );
}