"use server";
import { userGet, userUpdate } from "./actions";
import UserEdit from "./useredit";

export default async function UserEditPage({ params }: { params: { id: number } }) {

  const userId = (await params).id;
  return (
    <UserEdit params={{id:userId, getFunc: userGet, updateFunc: userUpdate}} />
  );
} 