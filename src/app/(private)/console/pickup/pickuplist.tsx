"use client";
import { useActionState, useEffect } from "react";

import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { reservationGetList } from "./actions";
import React from "react";
import { Loader } from "@/components/uicustom/loader";
import PickUpListSearch from "@/components/searchs/pickuplistsearch";
import PickUpListTable from "@/components/tables/pickuplisttable";

export default function PickUpList() {

  const formRef = React.useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(reservationGetList, {
    error: false,
    message: ""
  });

  useEffect(() => {
    if (state.message) {
      toast(state.message);
    }
  }, [state]);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isPending} />
      <Group className="flex w-full">
        <GroupTitle>
          Pick-Up List
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <PickUpListSearch formRef={formRef} />
              <PickUpListTable formState={state} formAction={formAction} formRef={formRef} />
              <input type="hidden" name="searchReservationStatus" value={"NEW"} />
            </form>
          </div>
        </GroupContent>
      </Group>
    </div>

  );
}