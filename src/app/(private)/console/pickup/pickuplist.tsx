"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import c from "@/lib/core/logger/ConsoleLogger";
import ReservationListTable from "@/components/tables/reservationlisttable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import CheckInTable from "@/components/tables/checkintable";
import PickUpSearch from "@/components/searchs/pickupsearch";
import PickUpTable from "@/components/tables/pickuptable";

export default function PickUpList() {
  c.i("Client > PickUpList");

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
        Pick-Up List
      </GroupTitle>
      <GroupContent>
        <div className="flex flex-col gap-4">
          <PickUpSearch />
          <PickUpTable formState={state} formAction={formAction} isPending={isPending} />
        </div>
      </GroupContent>
    </Group>
  );
}