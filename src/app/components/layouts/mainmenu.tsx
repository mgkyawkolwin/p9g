'use server';

import { auth } from '@/app/auth';
import MainMenuClient from './mainmenuclient';
// import { getUserMenuPermissions } from './actions';
// import dynamic from 'next/dynamic';

// const MainMenuClient = dynamic(() => import('./mainmenuclient'), {
//   ssr: false, // Prevents server rendering — purely client-side
// });


export default async function MainMenu() {
  const session = await auth();
  // const permissions = await getUserMenuPermissions(session.user?.role || '');
  // const { default: MainMenuClient } = await import('./mainmenuclient');

  return (<MainMenuClient role={session?.user?.role} />);
}