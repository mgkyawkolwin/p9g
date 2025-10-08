'use client';

import { clearCache } from '@/app/actions';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export function MainMenu() {
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const reportsRef = useRef(null);
  const settingsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (reportsRef.current && !reportsRef.current.contains(event.target)) {
        setReportsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleReports = () => {
    setReportsOpen(!reportsOpen);
    setSettingsOpen(false); // Close settings if open
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
    setReportsOpen(false); // Close reports if open
  };

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
      
      {/* Reports Menu */}
      <nav>
        <ul className="flex space-x-4">
          <li className="relative" ref={reportsRef}>
            <div className="inline-block">
              <button
                onClick={toggleReports}
                className="text-sm font-medium text-white hover:text-blue-600 focus:outline-none"
              >
                Reports
              </button>
              <ul 
                className={`absolute left-0 mt-1 w-48 text-white bg-[#333] shadow-lg py-1 transition-all duration-200 z-50 ${
                  reportsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <li>
                  <Link 
                    href="/console/reports/dailysummaryperson" 
                    className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                    onClick={() => setReportsOpen(false)}
                  >
                    Daily Summary (Person)
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/console/reports/dailysummaryguestsrooms" 
                    className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                    onClick={() => setReportsOpen(false)}
                  >
                    Daily Summary (Guests & Rooms)
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/console/reports/dailysummaryincome" 
                    className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                    onClick={() => setReportsOpen(false)}
                  >
                    Daily Summary (Income)
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/console/reports/dailyreservationdetail" 
                    className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                    onClick={() => setReportsOpen(false)}
                  >
                    Daily Reservation Detail
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      {/* Settings Menu */}
      <nav>
        <ul className="flex space-x-4">
          <li className="relative" ref={settingsRef}>
            <div className="inline-block">
              <button
                onClick={toggleSettings}
                className="text-sm font-medium text-white hover:text-blue-600 focus:outline-none"
              >
                Settings
              </button>
              <ul 
                className={`absolute left-0 mt-1 w-48 text-white bg-[#333] shadow-lg py-1 transition-all duration-200 z-50 ${
                  settingsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <li>
                  <button 
                    onClick={async () => { 
                      await clearCache(); 
                      setSettingsOpen(false);
                    }} 
                    className="block w-full text-left px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                  >
                    Clear Cache
                  </button>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}