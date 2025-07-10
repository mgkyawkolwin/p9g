"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import {
  ColumnDef
} from "@tanstack/react-table"

import DataTable from "./datatable"
import { ReservationEntity } from "@/data/orm/drizzle/mysql/schema"
import c from "@/lib/core/logger/ConsoleLogger"
import { FormState } from "@/lib/types"
import { useRouter } from "next/navigation"
import Reservation from "@/domain/models/Reservation"
import Customer from "@/domain/models/Customer"
import { access } from "fs"
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"




interface DataTableProps<TData, TValue> {
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function CheckOutListTable<TData, TValue>({
  formState,
  formAction,
  formRef
}: DataTableProps<TData, TValue>) {
  c.i('Client > CheckOutListTable');
  c.d(JSON.stringify(formState));

  const router = useRouter();

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "customReservationInfo",
      header: "ID",
      accessorFn: (row, index) => {
        return <span><a href={`/console/reservations/${row.id}/edit`}>{row.id.substring(0, 8)}</a><br />{row.reservationStatusText}<br />{row.reservationTypeText}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "customers",
      cell: ({ row }) => (
        <div>
          {row.original.customers?.map((customer, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {customer.name} ({customer.nationalId} / {customer.passport} / {customer.phone} / {customer.email})
            </React.Fragment>
          ))}
        </div>
      ),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer Info
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "roomInfo",
      header: "",
      accessorFn: (row, index) => {
        return <span>{row.noOfGuests ? row.noOfGuests + ' pax(s)' : ''}<br />{row.roomNo}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "checkInCheckOut",
      header: "Check-In / Check-Out",
      accessorFn: (row, index) => {
        return <span>{new Date(row.checkInDateUTC).toLocaleDateString('sv-SE')} - {new Date(row.checkOutDateUTC).toLocaleDateString('sv-SE')}<br />{row.noOfDays} days</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "arrivalDeparture",
      header: "Arrival / Departure",
      accessorFn: (row, index) => {
        return <span>{new Date(row.arrivalDateTimeUTC).toLocaleString('sv-SE')} {row.pickUpTypeText}<br />
          {new Date(row.departureDateTimeUTC).toLocaleString('sv-SE')} {row.dropOffTypeText}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "depositInfo",
      header: "Deposit",
      accessorFn: (row, index) => {
        return <span>{row.depositAmount > 0 ? row.depositAmount + ' ' + row.depositCurrency : ''} <br /> {row.depositDateUTC ? new Date(row.depositDateUTC).toLocaleDateString('sv-SE') : ""}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "remark",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Remark
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex gap-1">
          <ButtonCustom type="button" variant={"black"} size={"sm"}>View Bill</ButtonCustom>
          <ButtonCustom type="button" variant={"green"} size={"sm"} onClick={() => {
            setCheckOutId(row.original.id);
            setActionVerb('CHECKOUT');
            setOpenCheckInDialog(true);
          }} >Check-Out</ButtonCustom>
        </div>
      }
    },
  ];

  const [openCheckInDialog, setOpenCheckInDialog] = React.useState(false);
  const [checkOutId, setCheckOutId] = React.useState('');
  const [actionVerb, setActionVerb] = React.useState('');

  React.useEffect(() => {
    //reset IDs and actionVerb
    setCheckOutId('');
    setActionVerb('');
  },[formState]);

  return (
    <>
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      
      <section className="flex">
        <Dialog key={'checkindialog'} open={openCheckInDialog} onOpenChange={setOpenCheckInDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>CONFIRM CHECK-OUT</DialogTitle>
              <DialogDescription>Are you sure you want to check-in the reservation?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"green"} type="button" onClick={async () => {
                setOpenCheckInDialog(false);
                setActionVerb('CHECKOUT');
                await formRef.current?.requestSubmit();
              }}>Yes</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  setCheckOutId('');
                  setOpenCheckInDialog(false);
                }}>No</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      <input type="hidden" name="actionVerb" value={actionVerb} />
      <input type="hidden" name="checkInId" value={checkOutId} />
    </>
  )
}