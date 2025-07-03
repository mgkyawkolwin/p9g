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
import React, { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import ReservationTopList from "./reservationtoplist";
import { ButtonCustom } from "@/components/uicustom/buttoncustom";
import { Customer, ReservationEntity, User } from "@/data/orm/drizzle/mysql/schema";
import GuestInformationForm from "@/components/forms/guestinformationform";
import { newReservationAction } from "./actions";
import c from "@/lib/core/logger/ConsoleLogger";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomerChooseTable from "@/components/tables/customerchoosetable";

export default function ReservationNew() {

  const [customerName, setCustomerName] = React.useState("");
  const [customerList, setCustomerList] = React.useState<Customer[]>([]);
  const [selectedCustomerList, setSelectedCustomerList] = React.useState<Customer[]>([]);
  const [newReservations, setNewReservations] = React.useState<ReservationEntity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [state, formAction, isPending] = useActionState(newReservationAction, {
    error: false,
    message: ""
  });
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    // setSelectedCustomerList([
    //   { id: "111", name: "Customer 1" } as Customer,
    //   { id: "222", name: "Customer 2" } as Customer,
    //   { id: "333", name: "Customer 3" } as Customer
    // ]);
    //submit form to retrieve reservation list
    if(formRef?.current){
      formRef.current.requestSubmit();
    }
  },[]);

  useEffect(() => {
    if (state.error) {
      toast(state.message);
      return;
    }

    if(state.data && state.data.reservations){
      c.i("Data is changed.");
      c.d(state.data.reservations);
      setNewReservations(state.data.reservations);
    }
    if(state.data && state.data.customers && state.data.customers.length > 0){
      c.i("Customer data is changed.");
      c.d(state.data.customers);
      setCustomerList(state.data.customers);
      setIsDialogOpen(true);
    }

  }, [state]);



  return (
    <form ref={formRef} className="flex flex-1 flex-col gap-4" action={formAction}>
      <div className="flex flex-1 flex-col gap-y-4">
        <Loader isLoading={isPending} />
        <section aria-label="Search" className="flex flex-row h-fit items-center gap-x-4">
          <InputWithLabel label="Search" defaultValue={customerName} onBlur={(e) => setCustomerName(e.target.value)}></InputWithLabel>
          <input type="hidden" name="searchName" value={customerName} />
          <ButtonCustom type="button" variant={"black"} onClick={() => {
            const formData = new FormData(formRef.current ?? undefined);
            let input = document.createElement("input");
            input.type = "hidden";
            input.name = "action";
            input.value = "SEARCH";
            formRef.current?.appendChild(input);
            formRef.current?.requestSubmit();
          }}>Search Customer</ButtonCustom>
        </section>
        <section aria-label="Guest List" className="flex w-full h-fit items-center gap-x-4">
          <GuestInformationForm data={selectedCustomerList} setData={setSelectedCustomerList}/>
        </section>
        <section aria-label="Bottom Section" className="flex flex-row gap-4">
          <section aria-label="New Reservation" className="flex">
            <ReservationDetailNewForm />
          </section>
          <section aria-label="Reservation List" className="flex w-full">
            <ReservationTopList data={newReservations}/>
          </section>
        </section>
        <section className="flex">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTitle></DialogTitle>
            <DialogContent className="flex min-w-[90vw]">
            
            <CustomerChooseTable data={customerList} selectedCustomers={selectedCustomerList} setSelectedCustomers={setSelectedCustomerList} setOpen={setIsDialogOpen}/>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </form>
  );
}