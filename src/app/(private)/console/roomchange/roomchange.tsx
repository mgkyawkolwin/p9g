"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import c from "@/lib/core/logger/ConsoleLogger";
import ReservationListTable from "@/components/tables/reservationlisttable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import CheckInTable from "@/components/tables/checkintable";

export default function RoomChange() {
  c.i("Client > RoomChange");

  const [state, formAction, isPending] = useActionState(userGetList, {
    error: false,
    message: ""
  });

  useEffect(() => {
    if(state.error){
      toast(state.message);
    }
  },[state]);

  return (
    <Group className="flex flex-1 w-auto">
      <GroupTitle>
        Room Change
      </GroupTitle>
      <GroupContent>
      <CheckInTable formState={state} formAction={formAction} isPending={isPending} />
      </GroupContent>
    </Group>
  );
}