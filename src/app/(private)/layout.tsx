'use server';

import {Header} from '@/components/layouts/header';
import {Footer} from '@/components/layouts/footer';
import { version as nextVersion } from 'next/package.json';
import packageJson from '@/package.json';
import { auth } from '../auth';


export default async function Layout({ children }: { children: React.ReactNode }) {

  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <Header location={session?.user?.location} userName={session?.user?.name} />
      <div className='flex flex-1 p-4 bg-[#aaaaaa] dark:bg-black'>
      {children}
      </div>
      <Footer nextVersion={nextVersion} nodeVersion={process.version} appVersion={packageJson.version}  />
    </div>
  );
}
