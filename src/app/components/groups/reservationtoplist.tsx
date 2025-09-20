"use client";

import ReservationTopTable from "@/app/components/tables/reservationtoptable";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import Reservation from "@/core/models/domain/Reservation";

export default function ReservationTopList({data} : {data:Reservation[]}) {
  

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