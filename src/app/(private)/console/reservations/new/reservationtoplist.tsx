"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import consoleLogger from "@/lib/core/logger/ConsoleLogger";
import ReservationTopTable from "@/components/tables/reservationtoptable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";

export default function ReservationTopList() {
  consoleLogger.logInfo("Client > ReservationList");

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
    <Group>
      <GroupTitle>
        Latest Reservations
      </GroupTitle>
      <GroupContent>
      <ReservationTopTable formState={state} formAction={formAction} isPending={isPending} />
      </GroupContent>
    </Group>
  );
}