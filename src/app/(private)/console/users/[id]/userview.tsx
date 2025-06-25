// app/CustomerList.tsx
"use client";

import { User } from "@/data/orm/drizzle/mysql/schema";

import { use, useEffect, useState } from "react";

import { userGet } from "@/app/(private)/console/users/[id]/actions";
import { toast } from "sonner";
import { Loader } from "@/components/uicustom/loader";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { InputWithLabel } from "@/components/uicustom/inputwithlabel";
import { Button } from "@/components/ui/button";

export default function UserView({ params }: { params: Promise<{ id: number }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  const fetchData = async () => {
    const response = await userGet(id);
    if(response.error)
      toast(response.message);
    else
      setUser(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div  className="flex flex-1">
      <Loader isLoading={loading} />
      <Group className="w-[500px] m-auto">
      <GroupTitle>
        User Detail
      </GroupTitle>
      <GroupContent>
        <div className="flex flex-col gap-4">
          <InputWithLabel label="User ID"  name="id" defaultValue={user?.id} />
          <InputWithLabel label="User Name"  name="userName" defaultValue={user?.userName ?? ""} />
          <InputWithLabel label="Email" type="email" name="email" defaultValue={user?.email} />
          
        </div>
      </GroupContent>
    </Group>
    </div>
  );
}