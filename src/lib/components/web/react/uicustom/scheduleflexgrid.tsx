'use client';

import Room from '@/core/models/domain/Room';
import React from 'react';
import RoomReservation from '@/core/models/domain/RoomReservation';
import { Theme } from '@/core/constants';

const reservationColors = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400',
  'bg-yellow-400', 'bg-purple-400', 'bg-pink-400',
  'bg-indigo-400', 'bg-teal-400', 'bg-orange-400'
];

const getColorForUUID = (uuid: string) => {
  // const hash = uuid.split('-').reduce((acc, segment) => 
  //   acc + parseInt(segment.slice(0, 2), 16), 0);
  const hash = parseInt(uuid.slice(0, 8), 16);
  return reservationColors[hash % reservationColors.length];
};

// Helper function to clamp dates to current month
const clampReservationToMonth = (rr: RoomReservation, month: Date): RoomReservation & { startDate: Date, endDate: Date } => {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  return {
    ...rr,
    startDate: new Date(Math.max(
      new Date(rr.checkInDate!).getTime(),
      monthStart.getTime()
    )),
    endDate: new Date(Math.min(
      new Date(rr.checkOutDate!).getTime(),
      monthEnd.getTime()
    ))
  };
};

export default function ScheduleFlexGrid({ rooms, month }: { rooms: Room[]; month: Date | undefined }) {

  if (!rooms || !month) return 'No Data ...';


  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Process all room data in one memo
  const processedRooms = rooms?.map(room => {
    // Clone reservations and clamp to current month
    const monthRoomReservations = room.roomReservations?.map(rr => clampReservationToMonth(rr, month)) ?? [];
    // //.filter((res : Reservation & any) => 
    //   new Date(res.startDate) <= new Date(res.endDate)
    // ) || [];

    // Sort and process spans
    const spans: { day: number; colSpan: number; rr: RoomReservation | null }[] = [];
    let currentDay = 1;

    const sortedRoomReservations = ([...monthRoomReservations]).sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    for (const rr of sortedRoomReservations) {
      const checkInDay = new Date(rr.startDate).getDate();
      const checkOutDay = new Date(rr.endDate).getDate();

      if (currentDay < checkInDay) {
        spans.push({
          day: currentDay,
          colSpan: checkInDay - currentDay,
          rr: null
        });
        currentDay = checkInDay;
      }

      spans.push({
        day: currentDay,
        colSpan: checkOutDay - checkInDay + 1,
        rr: rr
      });
      currentDay = checkOutDay + 1;
    }

    if (currentDay <= daysInMonth) {
      spans.push({
        day: currentDay,
        colSpan: daysInMonth - currentDay + 1,
        rr: null
      });
    }

    return { room, spans };
  });

  return (
    <div className={`w-full ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}>
      {/* Header Row */}
      <div className={`flex w-full`}>
        <div className={`w-32 flex-shrink-0 p-2 font-medium border sticky left-0 ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}>
          Room \ Day
        </div>
        {daysArray.map(day => (
          <div key={`header-${day}`} className={`flex-1 p-2 text-center border-b font-medium ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Room Rows */}
      {processedRooms?.map(({ room, spans }) => (
        <div key={room.id} className={`flex w-full border-b ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}>
          <div className={`w-32 flex-shrink-0 p-2 border-r sticky left-0 ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}>
            {room.roomNo}
          </div>
          <div className={`flex flex-1 ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}>
            {spans.map((span, index) => (
              <div
                key={`${room.id}-${span.day}-${index}`}
                className={`h-10 ${span.rr ? `${getColorForUUID(span.rr.id)} rounded-lg mx-px` : `${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}`}
                style={{ flex: `${span.colSpan} 0 0` }}
                title={span.rr ? `[${new Date(span.rr.checkInDate!).toLocaleDateString('sv-SE')}] - [${new Date(span.rr.checkOutDate!).toLocaleDateString('sv-SE')}]\n${span.rr.reservationId}` : ''}
                onClick={() => { navigator.clipboard.writeText(span.rr.reservationId || '') }}
              >
                {span.rr && (
                  <div className="relative w-full h-full">
                    <div className="absolute z-10 hidden group-hover:block px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap -top-8">
                      {span.rr.reservationId}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}