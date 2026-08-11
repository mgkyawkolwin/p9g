"use client";
import { useActionState, useEffect } from "react";

import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { reservationGetList } from "./actions";
import React from "react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import CheckOutListSearch from "@/app/components/searchs/checkoutlistsearch";
import CheckOutListTable from "@/app/components/tables/checkoutlisttable";
import { useParams } from 'next/navigation';

export default function CheckOutList() {
  const params = useParams();

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
              <input type="hidden" name="location" value={params.location} />
            </form>
          </div>
        </GroupContent>
      </Group>
    </div>

  );
}