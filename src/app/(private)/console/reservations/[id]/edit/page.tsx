"use server";

import ReservationEdit from "./reservationedit";

export default async function ReservationNewPage({ params }: { params: { id: string } }) {
  const {id} = await params;

  return (
    <ReservationEdit id={id} />
  );
}