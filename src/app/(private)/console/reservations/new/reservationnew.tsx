'use client';

import ReservationDetailForm from "@/components/basicforms/reservationdetailform";
import ReservationDetailNewForm from "@/components/forms/reservationdetailnewform";
import DataTable from "@/components/tables/datatable";
import GuestInformationTable from "@/components/tables/guestinformationtable";
import { Button } from "@/components/ui/button";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { InputWithLabel } from "@/components/uicustom/inputwithlabel";
import { Loader } from "@/components/uicustom/loader";
import { FormState } from "@/lib/types";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import ReservationTopList from "./reservationtoplist";

export default function ReservationNew({ action }: { action: (formState: FormState, formData: FormData) => Promise<FormState> }) {

  const [state, formAction, isPending] = useActionState(action, {
    error: false,
    message: "",
    data: null,
    formData: null
  });

  useEffect(() => {
    if (state.error) {
      toast(state.message);
    } else {
      toast(state.message);
    }
  }, [state]);



  return (
    <div className="flex flex-1 flex-col gap-y-4">
      <Loader isLoading={isPending} />
      <section aria-label="Search" className="flex flex-row h-fit items-center gap-x-4">
        <InputWithLabel label="Search"></InputWithLabel>
        <Button>Search Customer</Button>
      </section>
      <Group className="flex w-auto">
        <GroupTitle>
          Guest Information
        </GroupTitle>
        <GroupContent>
          <form action={formAction} className="flex flex-1">
            <GuestInformationTable formState={state} formAction={formAction} isPending={isPending} />
          </form>
        </GroupContent>
      </Group>
      <section aria-label="Bottom Section" className="flex flex-row gap-4">
        <section aria-label="New Reservation" className="flex">
          <ReservationDetailNewForm />
        </section>
        <section aria-label="Reservation List" className="flex">
          <ReservationTopList />
        </section>
      </section>
    </div>
  );
}