'use client';

import ReservationDetailForm from "@/components/basicforms/reservationdetailform";
import ReservationDetailNewForm from "@/components/forms/reservationdetailnewform";
import DataTable from "@/components/tables/datatable";
import CustomerInformationTable from "@/components/tables/customerinformationtable";
import { Button } from "@/components/ui/button";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { InputWithLabel } from "@/components/uicustom/inputwithlabel";
import { Loader } from "@/components/uicustom/loader";
import { FormState } from "@/lib/types";
import React, { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import ReservationTopList from "./reservationtoplist";
import { ButtonCustom } from "@/components/uicustom/buttoncustom";
import { CustomerEntity, ReservationEntity, User } from "@/data/orm/drizzle/mysql/schema";
import CustomerInformationForm from "@/components/forms/customerinformationform";
import { newReservationAction } from "./actions";
import c from "@/lib/core/logger/ConsoleLogger";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomerChooseTable from "@/components/tables/customerchoosetable";

export default function ReservationNew() {

  const [actionVerb, setActionVerb] = React.useState('');
  const [customerName, setCustomerName] = React.useState("");
  const [customerList, setCustomerList] = React.useState<CustomerEntity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newReservations, setNewReservations] = React.useState<ReservationEntity[]>([]);
  const [selectedCustomerList, setSelectedCustomerList] = React.useState<CustomerEntity[]>([]);

  const [state, formAction, isPending] = useActionState(newReservationAction, {
    error: false,
    message: ""
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if(formRef?.current){
      formRef.current.requestSubmit();
    }
  },[]);

  React.useEffect(() => {
    c.i('useEfect > ActionVerb is changed.');
    //when setting actionVerb, submit the form
    //setting in onClick and submitting not working
    if(actionVerb){
      formRef?.current?.requestSubmit();
    }
  },[actionVerb]);
  

  useEffect(() => {
    c.i('useEffect > state or isPending is changed.');
    if (!isPending && state.message) {
      toast(state.message);
    }

    if(state.data && state.data.reservations){
      c.i("Data is changed.");
      c.d(state.data.reservations);
      setNewReservations(state.data.reservations);
    }
    if(state.data && state.data.customers && state.data.customers.length > 0 && !isPending){
      c.i("Customer data is changed.");
      c.d(state.data.customers);
      setCustomerList(state.data.customers);
      setIsDialogOpen(true);
    }

  }, [state, isPending]);


  return (
    <form ref={formRef} className="flex flex-1 flex-col gap-4" action={formAction}>
      <div className="flex flex-1 flex-col gap-y-4">
        <Loader isLoading={isPending} />
        <section aria-label="Search" className="flex flex-row h-fit items-center gap-x-4">
          <InputWithLabel label="Search" defaultValue={customerName} onBlur={(e) => setCustomerName(e.target.value)}></InputWithLabel>
          <input type="hidden" name="searchName" value={customerName} />
          <ButtonCustom type="button" variant={"black"} onClick={() => {
            setActionVerb('SEARCH');
          }}>Search Customer</ButtonCustom>
        </section>
        <section aria-label="Guest List" className="flex w-full h-fit items-center gap-x-4">
          <CustomerInformationForm data={selectedCustomerList} setData={setSelectedCustomerList}/>
        </section>
        <section aria-label="Bottom Section" className="flex flex-row gap-4">
          <section aria-label="New Reservation" className="flex">
            <ReservationDetailNewForm formRef={formRef} isPending={isPending} setActionVerb={setActionVerb} />
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
      <input type="hidden" name="actionVerb" value={actionVerb} />
      <input type="hidden" name="customers" value={JSON.stringify(selectedCustomerList.map(c => ({id:c.id})))} />
    </form>
  );
}