'use server';

import { Header } from '@/app/components/layouts/header';
import { Footer } from '@/app/components/layouts/footer';
import nextPackageJson from 'next/package.json';
import packageJson from '@/package.json';
import { auth } from '../auth';
import { GlobalProvider } from '../contexts/globalcontext';


export default async function Layout({ children }: { children: React.ReactNode }) {

  const session = await auth();

  return (
    <GlobalProvider location={session.user.location}>
      <div className="flex flex-1 flex-col">
        <Header location={session?.user?.location} userName={session?.user?.name} />
        <div className='flex flex-1 p-4 bg-[#aaaaaa] dark:bg-black'>
          {children}
        </div>
        <Footer nextVersion={nextPackageJson.version} nodeVersion={process.version} appVersion={packageJson.version} />
      </div>
    </GlobalProvider>
  );
}
