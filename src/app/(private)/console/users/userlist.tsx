"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/app/components/tables/userlisttable";
import React from "react";

export default function UserList() {

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