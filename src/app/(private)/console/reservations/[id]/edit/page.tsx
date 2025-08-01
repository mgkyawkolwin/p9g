"use server";

import ReservationEdit from "./reservationedit";

export default async function ReservationNewPage(props : { params: Promise<{ id: string }> }) {
  const {id} = await props.params;

  return (
    <ReservationEdit id={id} />
  );
}