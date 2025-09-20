"use client";
import { useActionState, useEffect } from "react";

import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import CustomerSearch from "@/app/components/searchs/customersearch";
// import CustomerTable from "@/components/tables/customertable";
import { customerGetList } from "./actions";
import React from "react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import CustomerTable from "@/app/components/tables/customertable";

export default function CustomerList() {

  const formRef = React.useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(customerGetList, {
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