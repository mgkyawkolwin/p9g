"use server";

import RoomScheduleList from "./roomschedulelist";

export default async function RoomSchedulePage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <RoomScheduleList />
  );
}