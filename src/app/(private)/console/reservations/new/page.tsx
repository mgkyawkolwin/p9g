"use server";

import ReservationNew from "@/app/(private)/console/reservations/new/reservationnew";
import { userCreate } from "./actions";

export default async function ReservationNewPage() {

  return (
    <ReservationNew action={userCreate}/>
  );
}