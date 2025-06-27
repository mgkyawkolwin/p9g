"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import consoleLogger from "@/lib/core/logger/ConsoleLogger";
import ReservationListTable from "@/components/tables/reservationlisttable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import CheckInTable from "@/components/tables/checkintable";
import CustomerSearch from "@/components/searchs/customersearch";
import CustomerTable from "@/components/tables/customertable";

export default function CustomerList() {
  consoleLogger.logInfo("Client > CustomerList");

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
        Customer List
      </GroupTitle>
      <GroupContent>
              <div className="flex flex-col gap-4">
                <CustomerSearch />
                <CustomerTable formState={state} formAction={formAction} isPending={isPending} />
              </div>
      </GroupContent>
    </Group>
  );
}