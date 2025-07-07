"use server";

import CustomerList from "./customerlist";

export default async function CustomerListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <CustomerList />
  );
}