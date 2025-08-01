"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import c from "@/lib/core/logger/ConsoleLogger";
import ReservationTopTable from "@/components/tables/reservationtoptable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { ReservationEntity } from "@/data/orm/drizzle/mysql/schema";

export default function ReservationTopList({data} : {data:ReservationEntity[]}) {
  c.i("Client > ReservationTopList");

  return (
    <Group className="flex w-full h-full">
      <GroupTitle>
        Latest Reservations
      </GroupTitle>
      <GroupContent>
        <ReservationTopTable data={data}  />
      </GroupContent>
    </Group>
  );
}