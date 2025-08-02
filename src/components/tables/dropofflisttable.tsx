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
import { InputCustom } from "../uicustom/inputcustom"
import { toast } from "sonner"
import { updateDropOffInfo } from "@/app/(private)/console/dropoff/actions";




interface DataTableProps{
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function DropOffListTable({
  formState,
  formAction,
  formRef
}: DataTableProps) {
  c.i('Client > PickUpListTable');
  c.d(JSON.stringify(formState));

  // const [carNos, setCarNos] = React.useState<{[key:number]:string|undefined}>({});

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
          accessorKey: "dropOffCarNo",
          header: "Vehicle No",
          cell: ({row}) => <InputCustom variant="table" size="xs" id={`car${row.original.id}`} defaultValue={String(row.original.dropOffCarNo ?? '')} />,
        },
        {
          accessorKey: "dropOffDriver",
          header: "Driver",
          cell: ({row}) => <InputCustom variant="table" size="md" id={`driver${row.original.id}`} defaultValue={String(row.original.dropOffDriver ?? '')} />,
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
              {customer.name}<br/> ({customer.nationalId} / {customer.passport} / {customer.phone} / {customer.email})
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
              <ButtonCustom type="button" variant={"green"} size={"sm"} onClick={async () => {
                const response = await updateDropOffInfo(row.original.id, 
                  (document.getElementById(`car${row.original.id}`) as HTMLInputElement)?.value, 
                  (document.getElementById(`driver${row.original.id}`) as HTMLInputElement)?.value);
                if(response.message)
                  toast(response.message);
              }} >Save Car No</ButtonCustom>
            </div>
          }
        },
  ];

  const [openDropOffDialog, setOpenDropOffDialog] = React.useState(false);
  const [reservationId, setReservationId] = React.useState('');
  const [actionVerb, setActionVerb] = React.useState('');

  React.useEffect(() => {
    //reset IDs and actionVerb
    setReservationId('');
    setActionVerb('');
  },[formState]);

  return (
    <>
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      
      <section className="flex">
        <Dialog key={'dropoffdialog'} open={openDropOffDialog} onOpenChange={setOpenDropOffDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>CONFIRM CHECK-OUT</DialogTitle>
              <DialogDescription>Are you sure you want to check-in the reservation?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"green"} type="button" onClick={async () => {
                setOpenDropOffDialog(false);
                setActionVerb('CHECKOUT');
                await formRef.current?.requestSubmit();
              }}>Yes</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  setReservationId('');
                  setOpenDropOffDialog(false);
                }}>No</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      <input type="hidden" name="actionVerb" value={actionVerb} />
      <input type="hidden" name="reservationId" value={reservationId} />
    </>
  )
}