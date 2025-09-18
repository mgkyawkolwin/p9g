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
const clampReservationToMonth = (res: RoomReservation, month: Date) : RoomReservation & {startDate:Date, endDate:Date} => {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  return {
    ...res,
    startDate: new Date(Math.max(
      new Date(res.checkInDate!).getTime(), 
      monthStart.getTime()
    )),
    endDate: new Date(Math.min(
      new Date(res.checkOutDate!).getTime(), 
      monthEnd.getTime()
    ))
  };
};

export default function ScheduleFlexGrid({ rooms, month }: { rooms: Room[]; month: Date | undefined }) {

  if(!rooms || !month) return 'Loading...';
  

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Process all room data in one memo
  const processedRooms = rooms?.map(room => {
    // Clone reservations and clamp to current month
    const monthRoomReservations = room.roomReservations?.map(res => 
      clampReservationToMonth(res, month)) ?? [];
      // //.filter((res : Reservation & any) => 
      //   new Date(res.startDate) <= new Date(res.endDate)
      // ) || [];

    // Sort and process spans
    const spans: { day: number; colSpan: number; res: RoomReservation | null }[] = [];
    let currentDay = 1;

    const sortedRoomReservations = ([...monthRoomReservations]).sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    for (const res of sortedRoomReservations) {
      const checkInDay = new Date(res.startDate).getDate();
      const checkOutDay = new Date(res.endDate).getDate();

      if (currentDay < checkInDay) {
        spans.push({
          day: currentDay,
          colSpan: checkInDay - currentDay,
          res: null
        });
        currentDay = checkInDay;
      }

      spans.push({
        day: currentDay,
        colSpan: checkOutDay - checkInDay + 1,
        res
      });
      currentDay = checkOutDay + 1;
    }

    if (currentDay <= daysInMonth) {
      spans.push({
        day: currentDay,
        colSpan: daysInMonth - currentDay + 1,
        res: null
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
                className={`h-10 ${span.res ? `${getColorForUUID(span.res.id)} rounded-lg mx-px` : `${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}`}
                style={{ flex: `${span.colSpan} 0 0` }}
                title={span.res ? `[${new Date(span.res.checkInDate!).toLocaleDateString('sv-SE')}] - [${new Date(span.res.checkOutDate!).toLocaleDateString('sv-SE')}]\n${span.res.reservationId}` : ''}
              >
                {span.res && (
                  <div className="relative w-full h-full">
                    <div className="absolute z-10 hidden group-hover:block px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap -top-8">
                      {span.res.reservationId}
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