"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import consoleLogger from "@/lib/core/logger/ConsoleLogger";
import ReservationListTable from "@/components/tables/reservationlisttable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import ReservationListSearch from "@/components/searchs/reservationlistsearch";

export default function ReservationList() {
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
        Reservation List
      </GroupTitle>
      <GroupContent>
        <div className="flex flex-col gap-4">
        <ReservationListSearch />
        <ReservationListTable formState={state} formAction={formAction} isPending={isPending} />
        </div>
      </GroupContent>
    </Group>
  );
}