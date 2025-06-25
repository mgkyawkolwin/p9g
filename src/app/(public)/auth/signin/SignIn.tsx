'use client';
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import { InputWithLabel } from "@/components/uicustom/inputwithlabel";
import { Button } from "@/components/ui/button";
import { FormState } from "@/lib/types";
import { Loader } from "@/components/uicustom/loader";

export default function SignIn({action} : { action: (state : FormState, formData : FormData) => Promise<FormState> }) {

  const [state, formAction, isPending] = useActionState(action, {
    error: false,
    message: "",
    data: null,
    formData: new FormData()
  });


  useEffect(() => {
    if(isPending == false && state.error){
      toast.error(state.message);
    }
  },[state]);

  
  return (
    <div className="flex flex-1 bg-gray-400">
      <Loader isLoading={isPending}/>
      <Group className="w-[500px] m-auto">
      <GroupTitle>
        Sign In
      </GroupTitle>
      <GroupContent>
      <form
      action={formAction}
    >
        <div className="flex flex-col gap-4">
          <InputWithLabel label="User Name"  name="userName" defaultValue={state.formData.get("userName")?.toString() ?? ""} />
          <InputWithLabel label="Password" type="password" name="password" />
          <Button disabled={isPending}>Sign In</Button>
        </div>
    </form>
      </GroupContent>
    </Group>
    </div>
  )
}