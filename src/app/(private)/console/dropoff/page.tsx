"use server";

import DropOffList from "./dropofflist";

export default async function DropOffListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <DropOffList />
  );
}