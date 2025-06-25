"use server";

import UserList from "./userlist";

export default async function UserListPage() {
  const allowedRoles = ['ADMIN', 'STAFF', 'AUTHENTICATED'];

  return (
    <UserList />
  );
}