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
import { reservationCancel, reservationCheckIn } from "@/app/(private)/console/checkin/actions"
import { toast } from "sonner"




interface DataTableProps<TData, TValue> {
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function CheckInListTable<TData, TValue>({
  formState,
  formAction,
  formRef
}: DataTableProps<TData, TValue>) {
  c.i('Client > CheckInListTable');
  c.d(JSON.stringify(formState));

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
          header: ({ column }) => {
            return (
              "Customer Info"
            )
          },
          cell: ({ row }) => (
            <div>
              {row.original.customers?.map((customer, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {customer.name}<br/> ({customer.nationalId} / {customer.passport} / {customer.phone} / {customer.email})
                </React.Fragment>
              ))}
            </div>
          ),
        },
    {
      accessorKey: "checkInCheckOut",
      header: "Check-In / Check-Out",
      accessorFn: (row, index) => {
        return <span>
          {new Date(row.checkInDateUTC).toLocaleDateString('sv-SE')} - {new Date(row.checkOutDateUTC).toLocaleDateString('sv-SE')}<br />
          {row.noOfDays} days, {row.noOfGuests ? row.noOfGuests + ' pax(s)' : ''}, {row.roomNo}</span>;
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
          <ButtonCustom type="button" variant={"black"} size={"sm"}>View Bill</ButtonCustom>
          <ButtonCustom type="button" variant={"green"} size={"sm"} onClick={() => {
            setCheckInId(row.original.id);
            setActionVerb('CHECKIN');
            setOpenCheckInDialog(true);
          }} >Check-In</ButtonCustom>
          <ButtonCustom type="button" variant={"red"} size={"sm"} onClick={() => {
            setCancelId(row.original.id);
            setActionVerb('CANCEL');
            setOpenCancelDialog(true);
            }}>Cancel</ButtonCustom>
        </div>
      }
    },
  ];

  const router = useRouter();

  const [openCancelDiallog, setOpenCancelDialog] = React.useState(false);
  const [openCheckInDialog, setOpenCheckInDialog] = React.useState(false);
  const [cancelId, setCancelId] = React.useState<string>('');
  const [checkInId, setCheckInId] = React.useState('');
  const [actionVerb, setActionVerb] = React.useState('');

  React.useEffect(() => {
    //reset IDs and actionVerb
    setCancelId('');
    setCheckInId('');
    setActionVerb('');
  },[formState]);

  return (
    <>
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      <section className="flex">
        <Dialog key={'canceldialog'} open={openCancelDiallog} onOpenChange={setOpenCancelDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>CONFIRM CANCEL</DialogTitle>
              <DialogDescription>Are you sure you want to cancel the reservation?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"red"} type="button" onClick={async () => {
                setOpenCancelDialog(false);
                const response = await reservationCancel(cancelId);
                toast(response.message);
                setCancelId('');
                //reload page
                formRef.current?.requestSubmit();
              }}>Yes</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  setCancelId('');
                  setOpenCancelDialog(false);
                }}>No</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      <section className="flex">
        <Dialog key={'checkindialog'} open={openCheckInDialog} onOpenChange={setOpenCheckInDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>CONFIRM CHECK-IN</DialogTitle>
              <DialogDescription>Are you sure you want to check-in the reservation?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"green"} type="button" onClick={async () => {
                setOpenCheckInDialog(false);
                const response = await reservationCheckIn(checkInId);
                toast(response.message);
                setCheckInId('');
                //reload page
                formRef.current?.requestSubmit();
              }}>Yes</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  setCheckInId('');
                  setOpenCheckInDialog(false);
                }}>No</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      <input type="hidden" name="cancelId" value={cancelId} />
      <input type="hidden" name="checkInId" value={checkInId} />
    </>
  )
}