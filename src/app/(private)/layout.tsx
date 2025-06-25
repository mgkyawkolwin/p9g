'use client';

import {Header} from '@/components/layouts/header';
import {Footer} from '@/components/layouts/footer';



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className='flex flex-1 p-4 bg-[#aaaaaa]'>
      {children}
      </div>
      <Footer />
    </div>
  );
}
