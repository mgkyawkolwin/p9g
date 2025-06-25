"use client";
import { useActionState, useEffect, useState } from "react";
//Local Imports
import { User } from "@/data/orm/drizzle/mysql/schema";
import { FormState } from "@/lib/types";
import { Loader } from "@/components/uicustom/loader";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { InputWithLabel } from "@/components/uicustom/inputwithlabel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UserEdit({ params }:{ params:{ id:number, getFunc:(id:number) => Promise<FormState>, updateFunc:(formState:FormState, formData:FormData) => Promise<FormState> } }) {
  const [user, setUser] = useState<User | null>(null);

  const [state, formAction, isPending] = useActionState(params.updateFunc, {
    error: false,
    message: "",
    data : null,
    formData: null
  });

  const fetchData = async () => {
    const result = await params.getFunc(params.id);
    if(!result.error){
      setUser(result.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [isPending]);

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
              <InputWithLabel label="User ID" type="number" name="id" readOnly defaultValue={user?.id} />
              <InputWithLabel label="User Name"  name="userName" defaultValue={user?.userName ?? ""} />
              <InputWithLabel label="Email" type="email" name="email" defaultValue={user?.email} />
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