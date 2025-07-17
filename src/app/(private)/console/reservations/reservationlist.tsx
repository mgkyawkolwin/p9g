"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import c from "@/lib/core/logger/ConsoleLogger";
import ReservationListTable from "@/components/tables/reservationlisttable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import ReservationListSearch from "@/components/searchs/reservationlistsearch";
import { reservationGetList } from "./actions";
import React from "react";
import { Loader } from "@/components/uicustom/loader";


export default function ReservationList() {
  c.i("Client > ReservationList");

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