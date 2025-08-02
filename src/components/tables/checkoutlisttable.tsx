"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "./datatable";
import c from "@/lib/core/logger/ConsoleLogger"
import { FormState } from "@/lib/types"
import Reservation from "@/domain/models/Reservation";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { reservationCheckOut } from "@/app/(private)/console/checkout/actions"
import { toast } from "sonner"




interface DataTableProps{
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function CheckOutListTable({
  formState,
  formAction,
  formRef
}: DataTableProps) {
  c.i('Client > CheckOutListTable');
  c.d(JSON.stringify(formState));


  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "customReservationInfo",
      header: "ID",
      accessorFn: (row) => {
        return <span>
          <a href={`/console/reservations/${row.id}/edit`}>{row.id.substring(0, 8)}</a><br />
          {row.reservationStatusText}<br />
          {row.reservationTypeText} 
          {row.prepaidPackageText ? <><br/>{row.prepaidPackageText}</> : ''}
          {row.promotionPackageText ? <><br/>{row.promotionPackageText}</> : ''}
          </span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "customers",
      header: () => {
        return (
          "Customer Info"
        )
      },
      cell: ({ row }) => (
        <div>
          {row.original.customers?.map((customer, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {customer.name}<br /> ({customer.nationalId} / {customer.passport} / {customer.phone} / {customer.email})
            </React.Fragment>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "arrivalDeparture",
      header: "Arrival / Departure",
      accessorFn: (row) => {
        return <span>
          {row.arrivalDateTimeUTC ? new Date(row.arrivalDateTimeUTC).toLocaleString('sv-SE') : ''} {row.arrivalFlight} {row.pickUpTypeText}<br />
          {row.departureDateTimeUTC ? new Date(row.departureDateTimeUTC).toLocaleString('sv-SE') : ''} {row.departureFlight} {row.dropOffTypeText}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "checkInCheckOut",
      header: "Check-In / Check-Out",
      accessorFn: (row) => {
        return <span>
          {new Date(row.checkInDateUTC!).toLocaleDateString('sv-SE')}<br/>
          {new Date(row.checkOutDateUTC!).toLocaleDateString('sv-SE')}<br />
          {row.noOfDays} days, {row.noOfGuests ? row.noOfGuests + ' pax(s)' : ''}, {row.roomNo}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "depositInfo",
      header: "Deposit",
      accessorFn: (row) => {
        return <span>{row.depositAmount > 0 ? row.depositAmount + ' ' + row.depositCurrency : ''} <br /> {row.depositDateUTC ? new Date(row.depositDateUTC).toLocaleDateString('sv-SE') : ""}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "remark",
      header: 'Remark',
      cell: (row) => {
        return <div className="flex max-w-[150px] whitespace-normal" >{String(row.getValue())}</div>
      }
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex gap-1">
          {/* <ButtonCustom type="button" variant={"black"} size={"sm"}>View Bill</ButtonCustom> */}
          <ButtonCustom type="button" variant={"green"} size={"sm"} onClick={() => {
            setCheckOutId(row.original.id);
            setOpenCheckOutDialog(true);
          }} >Check-Out</ButtonCustom>
        </div>
      }
    },
  ];

  const [openCheckOutDialog, setOpenCheckOutDialog] = React.useState(false);
  const [checkOutId, setCheckOutId] = React.useState('');

  return (
    <>
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />

      <section className="flex">
        <Dialog key={'checkindialog'} open={openCheckOutDialog} onOpenChange={setOpenCheckOutDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>CONFIRM CHECK-OUT</DialogTitle>
              <DialogDescription>Are you sure you want to check-in the reservation?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"green"} type="button" onClick={async () => {
                setOpenCheckOutDialog(false);
                const response = await reservationCheckOut(checkOutId);
                toast(response.message);
                setCheckOutId('');
                await formRef.current?.requestSubmit();
              }}>Yes</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  setCheckOutId('');
                  setOpenCheckOutDialog(false);
                }}>No</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </>
  )
}