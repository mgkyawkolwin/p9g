"use server";

import UserView from "./userview";

export default async function UserViewPage({ params }: { params: Promise<{ id: number }> }) {
  
  return (
    <UserView params={params} />
  );
}