"use server";

import PickUpList from "./pickuplist";

export default async function PickUpListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <PickUpList />
  );
}