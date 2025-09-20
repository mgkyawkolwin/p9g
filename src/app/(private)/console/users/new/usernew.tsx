'use client';

import { Button } from "@/lib/components/web/react/ui/button";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { InputWithLabel } from "@/lib/components/web/react/uicustom/inputwithlabel";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { FormState } from "@/core/types";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export default function UserNew({action}:{action:(formState:FormState,formData:FormData)=>Promise<FormState>}) {

  const [state, formAction, isPending] = useActionState(action, {
    error: false,
    message: "",
    data:null,
    formData:null
  });

  useEffect(() => {
    if(state.error){
      toast(state.message);
    }else{
      toast(state.message);
    }
  }, [state]);



  return (
    <div  className="flex flex-1">
            <Loader isLoading={isPending} />
            <Group className="w-[500px] m-auto">
            <GroupTitle>
              User Detail
            </GroupTitle>
            <GroupContent>
            <form action={formAction}>
              <div className="flex flex-col gap-4">
                  <InputWithLabel label="User Name"  name="userName" />
                  <InputWithLabel label="Email" type="email" name="email" />
                  <div className="flex flex-1 gap-x-4">
                    <Button name="action" value={"delete"} type="submit">Delete</Button>
                    <Button name="action" value={"delete"} type="submit">Save</Button>
                  </div>
                
              </div>
              </form>
            </GroupContent>
          </Group>
          </div>
  );
}