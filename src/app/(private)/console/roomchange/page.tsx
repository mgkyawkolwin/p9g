"use server";

import RoomChange from "./roomchange";

export default async function RoomChangePage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <RoomChange />
  );
}