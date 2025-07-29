'use client';

import Link from 'next/link';
import SignOutButton from '../uicustom/signoutbutton';
import {signOutAction} from '@/app/actions';

export function MainMenu() {

  return (
    <div className='flex gap-x-6 items-center'>
     
      <Link
        href="/console/reservations/new"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        New Reservation
      </Link>
      <Link
        href="/console/reservations"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Reservation List
      </Link>
      <Link
        href="/console/checkin"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Check In
      </Link>
      <Link
        href="/console/checkout"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Check Out
      </Link>
      <Link
        href="/console/pickup"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Pick Up
      </Link>
      <Link
        href="/console/dropoff"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Drop Off
      </Link>
      <Link
        href="/console/roomchange"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Room Change
      </Link>
      <Link
        href="/console/roomschedule"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Room Schedule
      </Link>
      <Link
        href="/console/customers"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Customers
      </Link>
      <nav>
    <ul className="flex space-x-4">
      <li className="relative">
        <div className="group inline-block">
        <Link
        href="/console/reports/dailysummary"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Reports
      </Link>
          <ul className="absolute left-0 mt-0 w-48 text-white bg-[#333] shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <li><a href="#" className="block px-4 py-2 hover:bg-[#666] text-sm font-medium">Laptops</a></li>
            <li><a href="#" className="block px-4 py-2 hover:bg-[#666] text-sm font-medium">Phones</a></li>
            <li><a href="#" className="block px-4 py-2 hover:bg-[#666] text-sm font-medium">Accessories</a></li>
          </ul>
        </div>
      </li>
    </ul>
  </nav>
      <Link
        href="/console/reports"
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Settings
      </Link>
      <SignOutButton action={signOutAction}/>
    </div>
  );
}
