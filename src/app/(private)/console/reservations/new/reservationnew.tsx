'use client';

import ReservationDetailNewForm from "@/components/forms/reservationdetailnewform";
import { InputWithLabel } from "@/components/uicustom/inputwithlabel";
import { Loader } from "@/components/uicustom/loader";
import React, { useActionState, useEffect } from "react";
import { toast } from "sonner";
import ReservationTopList from "@/components/groups/reservationtoplist";
import { ButtonCustom } from "@/components/uicustom/buttoncustom";
import CustomerInformationForm from "@/components/forms/customerinformationform";
import { getTopReservationsAction, searchCustomer } from "./actions";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CustomerChooseTable from "@/components/tables/customerchoosetable";
import Customer from "@/domain/models/Customer";
import Reservation from "@/domain/models/Reservation";
import CustomerNewForm from "@/components/forms/customernewform";
import { InputCustom } from "@/components/uicustom/inputcustom";
import { Label } from "@/components/ui/label";

export default function ReservationNew() {

  const [isPending, setIsPending] = React.useState(false);
  const [customerName, setCustomerName] = React.useState("");
  const [customerList, setCustomerList] = React.useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newReservations, setNewReservations] = React.useState<Reservation[]>([]);
  const [selectedCustomerList, setSelectedCustomerList] = React.useState<Customer[]>([]);

  const openCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);


  async function getAndSetReservations(){
    const response = await getTopReservationsAction();
    if(response.message) toast(response.message);
    if(!response.error && response.data.reservations) setNewReservations(response.data.reservations);
  }


  React.useEffect(() => {
    getAndSetReservations();
  },[]);


  const handleCustomerSaved = (customer: Customer) => {
    setSelectedCustomerList(prev => [...prev, customer]);
  };


  const handleReservationSaved = async () => {
    const response = await getTopReservationsAction();
    if(response.message) toast(response.message);
    if(!response.error && response.data.reservations){
      setNewReservations(response.data.reservations);
      setSelectedCustomerList([]);
    }
  };


  return (
    
      <div className="flex flex-1 flex-col gap-y-4">
        <Loader isLoading={isPending} />
        <section aria-label="Search" className="flex flex-row h-fit items-center gap-x-4">
          <Label>Search</Label>
          <InputCustom size="lg" defaultValue={customerName} onBlur={(e) => setCustomerName(e.target.value)}></InputCustom>
          <input type="hidden" name="searchName" value={customerName} />
          <ButtonCustom type="button" variant={"black"} onClick={async () => {
            setIsPending(true);
            const response = await searchCustomer(customerName);
            if(response.error){
              toast(response.message);
            }else{
              setCustomerList(response.data);
              setIsDialogOpen(true);
            }
            setIsPending(false);
          }}>Search Customer</ButtonCustom>
          <ButtonCustom type="button" variant={"green"} onClick={() => {
            openCallbackFunc.current?.openDialog(true);
          }}>New Customer</ButtonCustom>
        </section>
        <section aria-label="Guest List" className="flex w-full h-fit items-center gap-x-4">
          <CustomerInformationForm data={selectedCustomerList} setData={setSelectedCustomerList}/>
        </section>
        <section aria-label="Bottom Section" className="flex flex-row gap-4">
          <section aria-label="New Reservation" className="flex">
            <ReservationDetailNewForm customers={selectedCustomerList} onReservationSaved={handleReservationSaved} />
          </section>
          <section aria-label="Reservation List" className="flex w-full">
            <ReservationTopList data={newReservations}/>
          </section>
        </section>
        <section className="flex">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTitle></DialogTitle>
            <DialogContent className="flex min-w-[90vw] p-8">
            <CustomerChooseTable data={customerList} selectedCustomers={selectedCustomerList} setSelectedCustomers={setSelectedCustomerList} setOpen={setIsDialogOpen}/>
            </DialogContent>
          </Dialog>
        </section>
        <section className="flex">
          <CustomerNewForm openCallback={(func) => openCallbackFunc.current = func} onSaved={handleCustomerSaved} />
        </section>
      </div>
      
    
  );
}