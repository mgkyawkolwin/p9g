'use client';

import { clearCache } from '@/app/actions';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
// import { getUserMenuPermissions } from './actions';
import { useParams } from 'next/navigation';

interface MenuPermissions {
  canAccessReservations: boolean;
  canAccessCheckin: boolean;
  canAccessCheckout: boolean;
  canAccessPickup: boolean;
  canAccessDropoff: boolean;
  canAccessRoomchange: boolean;
  canAccessRoomschedule: boolean;
  canAccessCustomers: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
}

interface MainMenuClientProps {
  permissions: MenuPermissions;
}

export default function MainMenuClient({ role }) {
  const params = useParams();
  const location = params.location as string;

  const [pookieOpen, setPookieOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const pookieRef = useRef<HTMLLIElement>(null);
  const reportsRef = useRef<HTMLLIElement>(null);
  const settingsRef = useRef<HTMLLIElement>(null);
  const logsRef = useRef<HTMLLIElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    //async () => permissions = await getUserMenuPermissions(role || '');
    function handleClickOutside(event: MouseEvent) {
      if (pookieRef.current && !pookieRef.current.contains(event.target as Node)) {
        setPookieOpen(false);
      }
      if (reportsRef.current && !reportsRef.current.contains(event.target as Node)) {
        setReportsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
      if (logsRef.current && !logsRef.current.contains(event.target as Node)) {
        setLogsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePookie = () => {
    setPookieOpen(!pookieOpen);
    setReportsOpen(false);
    setSettingsOpen(false);
  };

  const toggleReports = () => {
    setReportsOpen(!reportsOpen);
    setPookieOpen(false);
    setSettingsOpen(false);
    setLogsOpen(false);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
    setPookieOpen(false);
    setReportsOpen(false);
    setLogsOpen(false);
  };

  const toggleLogs = () => {
    setLogsOpen(!logsOpen);
    setPookieOpen(false);
    setReportsOpen(false);
    setSettingsOpen(false);
  };

  return (
    <div className='flex gap-x-6 items-center'>
      {/* Reservations */}
      {role === "ADMIN" && (
        <>
          <Link
            href={`/${location}/console/reservations/new`}
            className="text-sm font-medium text-white hover:text-blue-600"
          >
            New Reservation
          </Link>
        </>
      )}

      {role === "ADMIN" && (
        <Link
          href={`/${location}/console/reservations`}
          className="text-sm font-medium text-white hover:text-blue-600"
        >
          Reservation List
        </Link>
      )}

      <Link
        href={`/${location}/console/checkin`}
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Check In
      </Link>

      <Link
        href={`/${location}/console/checkout`}
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Check Out
      </Link>

      <Link
        href={`/${location}/console/pickup`}
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Pick Up
      </Link>

      <Link
        href={`/${location}/console/dropoff`}
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Drop Off
      </Link>

      <Link
        href={`/${location}/console/roomchange`}
        className="text-sm font-medium text-white hover:text-blue-600"
      >
        Room Change
      </Link>

      {role === "ADMIN" && (
        <Link
          href={`/${location}/console/roomschedule`}
          className="text-sm font-medium text-white hover:text-blue-600"
        >
          Room Schedule
        </Link>
      )}

      {role === "ADMIN" && (
        <Link
          href={`/${location}/console/customers`}
          className="text-sm font-medium text-white hover:text-blue-600"
        >
          Customers
        </Link>
      )}

      {role === "ADMIN" && (
        <Link
          href={`/${location}/console/invoices`}
          className="text-sm font-medium text-white hover:text-blue-600"
        >
          Invoices
        </Link>
      )}

      {/* Reports Menu - Only if user has reports permission */}
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
                className={`absolute left-0 mt-1 w-68 text-white bg-[#333333] shadow-lg py-1 transition-all duration-200 z-50 ${reportsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
              >
                {(role === 'ADMIN' || role === 'RECEPTION') && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/dailysummaryperson`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Daily Summary (Person)
                    </Link>
                  </li>
                )}
                {role === 'ADMIN' && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/dailysummaryguestsrooms`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Daily Summary (Guests & Rooms)
                    </Link>
                  </li>)}
                {(role === 'ADMIN' || role === 'RECEPTION') && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/dailysummaryzoneguests`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Daily Summary (Zone Guests)
                    </Link>
                  </li>)}
                {role === 'ADMIN' && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/dailysummaryincome`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Daily Summary (Income)
                    </Link>
                  </li>)}
                {role === 'ADMIN' && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/dailysummaryreservationstatus`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Daily Summary (Reservation Status)
                    </Link>
                  </li>)}
                {role === 'ADMIN' && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/dailysummaryroomoccupancy`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Daily Summary (Room Occupancy)
                    </Link>
                  </li>)}
                {role === 'ADMIN' && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/monthlysummaryreservationstatus`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Monthly Summary (Reservation Status)
                    </Link>
                  </li>)}
                {role === 'ADMIN' && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/dailyreservationdetail`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Daily Reservation Detail
                    </Link>
                  </li>
                )}
                {(role === 'ADMIN' || role === 'RECEPTION') && (
                  <li>
                    <Link
                      href={`/${location}/console/reports/pickupdropoff`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setReportsOpen(false)}
                    >
                      Pickup & Dropoff Report
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      {/* Settings Menu */}
      {role === 'ADMIN' && (
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
                  className={`absolute left-0 mt-1 w-48 text-white bg-[#333] shadow-lg py-1 transition-all duration-200 z-50 ${settingsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
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
      )}
      <nav>
        <ul className="flex space-x-4">
          <li className="relative" ref={pookieRef}>
            <div className="inline-block">
              <button
                onClick={togglePookie}
                className="text-sm font-medium text-white hover:text-blue-600 focus:outline-none"
              >
                Pookie
              </button>
              <ul
                className={`absolute left-0 mt-1 w-48 text-white bg-[#333] shadow-lg py-1 transition-all duration-200 z-50 ${pookieOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
              >
                <li>
                  <Link
                    href={`/${location}/pookie/draw`} target='new'
                    className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                    onClick={() => setPookieOpen(false)}
                  >
                    Draw
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${location}/console/pookie/timetable`}
                    className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                    onClick={() => setPookieOpen(false)}
                  >
                    Time Table
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      {role === 'ADMIN' && (
        <nav>
          <ul className="flex space-x-4">
            <li className="relative" ref={logsRef}>
              <div className="inline-block">
                <button
                  onClick={toggleLogs}
                  className="text-sm font-medium text-white hover:text-blue-600 focus:outline-none"
                >
                  Logs
                </button>
                <ul
                  className={`absolute left-0 mt-1 w-56 text-white bg-[#333] shadow-lg py-1 transition-all duration-200 z-50 ${logsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                >
                  <li>
                    <Link
                      href={`/${location}/console/logs/reservations`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setLogsOpen(false)}
                    >
                      Reservation Logs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${location}/console/logs/roomcharges`}
                      className="block px-4 py-2 hover:bg-[#666] text-sm font-medium whitespace-nowrap"
                      onClick={() => setLogsOpen(false)}
                    >
                      Room Charge Logs
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}