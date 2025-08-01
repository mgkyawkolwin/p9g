"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import c from "@/lib/core/logger/ConsoleLogger";
import React from "react";

export default function UserList() {
  c.i("Client > UserList");

  const [state, formAction, isPending] = useActionState(userGetList, {
    error: false,
    message: ""
  });

  const formRef = React.useRef(null);

  useEffect(() => {
    if(state.error){
      toast(state.message);
    }
  },[state]);

  return (
    <>
    <form ref={formRef}></form>
    <UserListTable formState={state} formAction={formAction} isPending={isPending} formRef={formRef} />
    </>
  );
}