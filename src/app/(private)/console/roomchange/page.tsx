"use server";

import RoomChangeList from "./roomchangelist";

export default async function RoomReservatoinListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <RoomChangeList />
  );
}