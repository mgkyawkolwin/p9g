"use client";
import { useActionState, useEffect } from "react";

import { userGetList } from "@/app/(private)/console/users/actions";
import { toast } from "sonner";
import UserListTable from "@/components/tables/userlisttable";
import c from "@/lib/core/logger/ConsoleLogger";
import ReservationTopTable from "@/components/tables/reservationtoptable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { Reservation } from "@/data/orm/drizzle/mysql/schema";

export default function ReservationTopList({data} : {data:Reservation[]}) {
  c.i("Client > ReservationTopList");
  c.d(data);

  return (
    <Group className="flex w-full">
      <GroupTitle>
        Latest Reservations
      </GroupTitle>
      <GroupContent>
        <ReservationTopTable data={data}  />
      </GroupContent>
    </Group>
  );
}