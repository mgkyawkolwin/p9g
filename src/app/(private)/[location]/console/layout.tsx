'use server';

import { Header } from '@/app/components/layouts/header';
import { Footer } from '@/app/components/layouts/footer';
import nextPackageJson from 'next/package.json';
import packageJson from '@/package.json';
import { auth } from '../../../auth';
import { GlobalProvider } from '../../../contexts/globalcontext';

// 1. Update the type definition to wrap params in a Promise
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ location: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const session = await auth();
  
  // 2. Await the params (which you are already doing, but the type was wrong)
  const { location } = await params;

  return (
    <GlobalProvider location={location}>
      <div className="flex flex-1 flex-col">
        <Header location={location} userName={session?.user?.name} />
        <div className="flex flex-1 p-4 bg-[#aaaaaa] dark:bg-black">
          {children}
        </div>
        <Footer 
          nextVersion={nextPackageJson.version} 
          nodeVersion={process.version} 
          appVersion={packageJson.version} 
        />
      </div>
    </GlobalProvider>
  );
}