"use server";

import CheckInList from "./checkinlist";

export default async function CheckInListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <CheckInList />
  );
}