"use server";

import CheckOutList from "./checkoutlist";

export default async function CheckOutListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <CheckOutList />
  );
}