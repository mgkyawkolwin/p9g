'use client';
import Reservation from '@/domain/models/Reservation';
import Room from '@/domain/models/Room';
import React from 'react';
import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';

// Optimized color generator for UUIDs
const reservationColors = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400',
    'bg-yellow-400', 'bg-purple-400', 'bg-pink-400',
    'bg-indigo-400', 'bg-teal-400', 'bg-orange-400',
    'bg-red-300', 'bg-blue-300', 'bg-green-300'
  ];
  
  const getColorForUUID = (uuid: string) => {
    // Simple but effective hash for UUIDs
    const hash = uuid.split('-').reduce((acc, segment) => 
      acc + parseInt(segment.slice(0, 2), 16), 0);
    return reservationColors[hash % reservationColors.length];
  };
  
  export default function ScheduleGrid({ rooms, month }: { rooms: Room[]; month: Date }) {
    const { year, monthIndex, daysInMonth } = useMemo(() => ({
      year: month.getFullYear(),
      monthIndex: month.getMonth(),
      daysInMonth: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    }), [month]);
  
    const processedRooms = useMemo(() => rooms?.map(room => {
      // Create a map of day => reservation for O(1) lookups
      const dayMap = new Map<number, { 
        reservation: Reservation; 
        color: string 
      }>();
  
      room.reservations?.forEach(reservation => {
        const checkIn = new Date(reservation.checkInDateUTC);
        const checkOut = new Date(reservation.checkOutDateUTC);
        const color = getColorForUUID(reservation.id);
  
        // Only process reservations that overlap with our target month
        if (checkIn.getMonth() <= monthIndex && checkOut.getMonth() >= monthIndex) {
          const startDay = checkIn.getMonth() === monthIndex ? checkIn.getDate() : 1;
          const endDay = checkOut.getMonth() === monthIndex ? checkOut.getDate() : daysInMonth;
  
          for (let day = startDay; day <= endDay; day++) {
            dayMap.set(day, { reservation, color });
          }
        }
      });
  
      return { ...room, dayMap };
    }), [rooms, year, monthIndex, daysInMonth]);
  
    return (
      <div className="overflow-auto max-w-full border rounded-lg">
        <div 
          className="grid gap-px bg-gray-200"
          style={{ 
            gridTemplateColumns: `150px repeat(${daysInMonth}, minmax(5px, 30px))` 
          }}
        >
          {/* Header Row */}
          <div className="bg-white p-2 sticky top-0 left-0 z-10 border-b font-medium shadow-sm">
            Room \ Day
          </div>
          
          {Array.from({ length: daysInMonth }, (_, i) => (
            <div 
              key={`day-${i+1}`} 
              className="bg-white p-1 text-center sticky top-0 border-b font-medium shadow-sm"
            >
              {i+1}
            </div>
          ))}
  
          {/* Room Rows */}
          {processedRooms?.map(room => (
            <React.Fragment key={`room-${room.id}`}>
              <div className="bg-white p-2 sticky left-0 z-10 border-r font-medium">
                {room.roomNo}
              </div>
              
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const reservationData = room.dayMap.get(day);
                
                return (
                    <div key={i} className="relative">
                    <div
                      key={`${room.id}-${day}`}
                      className={`h-10 ${reservationData?.color || 'bg-gray-100'}`}
                    >
                      {/* Hidden tooltip that appears on hover */}
                      {reservationData && (
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <span className='flex w-full h-full bg-black/10'>&nbsp;</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {reservationData.reservation.id}
                        </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }