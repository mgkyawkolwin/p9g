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
import { updatePickUpCarNo } from "@/app/(private)/console/pickup/actions"
import { toast } from "sonner"




interface DataTableProps{
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function PickUpListTable({
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
        return <span><a href={`/console/reservations/${row.id}/edit`}>{row.id.substring(0, 8)}</a><br />{row.reservationStatusText}<br />{row.reservationTypeText}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "pickUpCarNo",
      header: "Vehicle No",
      // accessorFn: (row, index) => {
      //   setCarNos(prev => ({...prev, [index]: row.pickUpCarNo}));
      //   return row.pickUpCarNo;
      // },
      cell: ({row}) => <InputCustom id={row.original.id} defaultValue={String(row.original.pickUpCarNo ?? '')} />,
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
      accessorKey: "checkInCheckOut",
      header: "Check-In / Check-Out",
      accessorFn: (row) => {
        return <span>
          {new Date(row.checkInDateUTC!).toLocaleDateString('sv-SE')} - {new Date(row.checkOutDateUTC!).toLocaleDateString('sv-SE')}<br />
          {row.noOfDays} days, {row.noOfGuests ? row.noOfGuests + ' pax(s)' : ''}, {row.roomNo}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "arrivalDeparture",
      header: "Arrival / Departure",
      accessorFn: (row) => {
        return (
          <span>{ row.arrivalDateTimeUTC ? new Date(row.arrivalDateTimeUTC).toLocaleString('sv-SE') : ''} <br/> 
          {row.pickUpTypeText}<br />
          {row.departureDateTimeUTC ? new Date(row.departureDateTimeUTC).toLocaleString('sv-SE') : ''}<br/> 
          {row.dropOffTypeText}</span>);
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
            const response = await updatePickUpCarNo(row.original.id, (document.getElementById(row.original.id) as HTMLInputElement)?.value);
            if(response.message)
              toast(response.message);
          }} >Save Car No</ButtonCustom>
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