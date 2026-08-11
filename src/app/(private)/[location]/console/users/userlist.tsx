"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/[location]/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/app/components/tables/userlisttable";
import React from "react";
import { useParams } from 'next/navigation';

export default function UserList() {
  const params = useParams();
  const location = params.location as string;

  const [state, formAction, isPending] = useActionState(userGetList, {
    error: false,
    message: ""
  });

  const formRef = React.useRef(null);

  useEffect(() => {
    if (state.error) {
      toast(state.message);
    }
  }, [state]);

  return (
    <>
      <form ref={formRef}>
        <input type="hidden" name="location" value={location} />
      </form>
      <UserListTable formState={state} formAction={formAction} isPending={isPending} formRef={formRef} />
    </>
  );
}