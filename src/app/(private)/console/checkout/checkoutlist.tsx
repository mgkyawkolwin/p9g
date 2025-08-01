"use client";
import { useActionState, useEffect } from "react";

import { toast } from "sonner";
import c from "@/lib/core/logger/ConsoleLogger";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { reservationGetList } from "./actions";
import React from "react";
import { Loader } from "@/components/uicustom/loader";
import CheckOutListSearch from "@/components/searchs/checkoutlistsearch";
import CheckOutListTable from "@/components/tables/checkoutlisttable";

export default function CheckOutList() {
  c.i("Client > CheckOutList");

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
          Check-Out List
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <CheckOutListSearch formRef={formRef} />
              <CheckOutListTable formState={state} formAction={formAction} formRef={formRef} />
            </form>
          </div>
        </GroupContent>
      </Group>
    </div>

  );
}