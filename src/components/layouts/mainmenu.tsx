'use client';

import Link from 'next/link';
import SignOutButton from '../uicustom/signoutbutton';
import {signOutAction} from '@/app/actions';

export function MainMenu() {

  return (
    <div className='flex gap-x-4 items-center'>
      <Link
        href="/console/reservations/new"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        New Reservation
      </Link>
      <Link
        href="/console/reservations"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        Reservation List
      </Link>
      <Link
        href="/console/checkin"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        Check In
      </Link>
      <Link
        href="/console/checkout"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        Check Out
      </Link>
      <Link
        href="/console/pickup"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        Pick Up
      </Link>
      <Link
        href="/console/dropoff"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        Drop Off
      </Link>
      <Link
        href="/console/roomchange"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        Room Change
      </Link>
      <Link
        href="/console/customers"
        className="text-l font-medium text-white hover:text-blue-600"
      >
        Customers
      </Link>
      <SignOutButton action={signOutAction}/>
    </div>
  );
}
