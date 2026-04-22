// app/CustomerList.tsx
"use client";

import User from "@/core/models/domain/User";
import { use, useEffect, useState } from "react";
import { userGet } from "@/app/(private)/[location]/console/users/[id]/actions";
import { toast } from "sonner";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { InputWithLabel } from "@/lib/components/web/react/uicustom/inputwithlabel";
import { useParams } from 'next/navigation';

export default function UserView({ params }: { params: Promise<{ id: number }> }) {
  const urlParams = useParams();
  const location = urlParams.location as string;

  const { id } = use(params);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);


  const fetchData = async () => {
    const response = await userGet(id, location);
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
          <InputWithLabel label="User ID"  name="id" />
          <InputWithLabel label="User Name"  name="userName" defaultValue={user?.userName ?? ""} />
          <InputWithLabel label="Email" type="email" name="email" defaultValue={user?.email} />
        </div>
      </GroupContent>
    </Group>
    </div>
  );
}