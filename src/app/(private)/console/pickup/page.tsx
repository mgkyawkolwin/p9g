"use server";

import PickUpList from "./pickuplist";

export default async function CheckOutListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <PickUpList />
  );
}