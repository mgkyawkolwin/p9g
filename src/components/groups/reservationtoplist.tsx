"use client";

import c from "@/lib/core/logger/ConsoleLogger";
import ReservationTopTable from "@/components/tables/reservationtoptable";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import Reservation from "@/domain/models/Reservation";

export default function ReservationTopList({data} : {data:Reservation[]}) {
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