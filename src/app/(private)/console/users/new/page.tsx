"use server";

import UserNew from "@/app/(private)/console/users/new/usernew";
import { userNew } from "./actions";

export default async function UserNewPage() {

  return (
    <UserNew action={userNew}/>
  );
}