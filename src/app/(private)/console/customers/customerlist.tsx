"use client";
import { RefObject, useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import c from "@/lib/core/logger/ConsoleLogger";
import ReservationListTable from "@/components/tables/reservationlisttable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import CheckInTable from "@/components/tables/checkintable";
import CustomerSearch from "@/components/searchs/customersearch";
import CustomerTable from "@/components/tables/customertable";
import { customerGetList, customerUpdate } from "./actions";
import React from "react";
import { Loader } from "@/components/uicustom/loader";

export default function CustomerList() {
  c.i("Client > CustomerList");

  const formRef = React.useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(customerGetList, {
    error: false,
    message: ""
  });

  const [rowFromState, rowFormAction, rowFormIsPending] = useActionState(customerUpdate, {
    error: false,
    message: ""
  });

  useEffect(() => {
    if (state.error) {
      toast(state.message);
    }
  }, [state]);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isPending} />
      <Group className="flex flex-1 w-auto">
        <GroupTitle>
          Customer List
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <CustomerSearch formAction={formAction} formRef={formRef} />
              <CustomerTable formState={state} formAction={formAction} formRef={formRef} />
            </form>
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}