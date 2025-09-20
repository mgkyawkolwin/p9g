"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import ReservationListTable from "@/app/components/tables/reservationlisttable";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import ReservationListSearch from "@/app/components/searchs/reservationlistsearch";
import { reservationGetList } from "./actions";
import React from "react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";


export default function ReservationList() {

  const formRef = React.useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(reservationGetList, {
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
      <Group className="flex w-full">
        <GroupTitle>
          Reservation List
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <ReservationListSearch formRef={formRef} />
              <ReservationListTable formState={state} formAction={formAction} formRef={formRef} />

              
            </form>

          </div>
        </GroupContent>
      </Group>
    </div>

  );
}