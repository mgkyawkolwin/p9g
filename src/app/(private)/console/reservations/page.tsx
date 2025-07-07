"use server";

import ReservationList from "./reservationlist";

export default async function ReservationListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <ReservationList />
  );
}