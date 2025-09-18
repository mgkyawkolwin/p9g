"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "../../../lib/components/web/react/uicustom/datatable";
import { FormState } from "@/lib/types";
import Reservation from "@/core/models/domain/Reservation";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";
import { updatePickUpInfo } from "@/app/(private)/console/pickup/actions";
import { toast } from "sonner";
import { getReservationStatusColorClass } from "@/lib/utils";




interface DataTableProps {
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function PickUpListTable({
  formState,
  formAction,
  formRef
}: DataTableProps) {

  // const [carNos, setCarNos] = React.useState<{[key:number]:string|undefined}>({});

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "customReservationInfo",
      header: "ID",
      accessorFn: (row) => {
        return <span>
          <a href={`/console/reservations/${row.id}/edit`}>{row.id.substring(0, 8)}</a><br />
          <span className={`font-bold ${getReservationStatusColorClass(row.reservationStatusText)}`}>{row.reservationStatusText}</span><br />
          <span>{row.reservationTypeText}</span>
          {row.prepaidPackageText ? <span className="font-bold text-[#ff00ff] dark:text-[#ff00ff]"><br />{row.prepaidPackageText}</span> : ''}
          {row.promotionPackageText ? <span className="font-bold text-[#dd5500] dark:text-[#ff9911]"><br />{row.promotionPackageText}</span> : ''}
        </span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "pickUpCarNo",
      header: "Vehicle No",
      cell: ({ row }) => <InputCustom variant="table" size="xs" id={`car${row.original.id}`} defaultValue={String(row.original.pickUpCarNo ?? '')} />,
    },
    {
      accessorKey: "pickUpDriver",
      header: "Driver",
      cell: ({ row }) => <InputCustom variant="table" size="md" id={`driver${row.original.id}`} defaultValue={String(row.original.pickUpDriver ?? '')} />,
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
              {customer.englishName} {customer.name}<br /> ({customer.nationalId} / {customer.passport} / {customer.phone} / {customer.email})
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
          {row.arrivalDateTime ? new Date(row.arrivalDateTime).toISODateTimeString() : ''} {row.arrivalFlight} {row.pickUpTypeText}<br />
          {row.departureDateTime ? new Date(row.departureDateTime).toISODateTimeString() : ''} {row.departureFlight} {row.dropOffTypeText}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "checkInCheckOut",
      header: "Check-In / Check-Out",
      accessorFn: (row) => {
        return <span>
          {new Date(row.checkInDate!).toISODateString()}<br />
          {new Date(row.checkOutDate!).toISODateString()}<br />
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
            const response = await updatePickUpInfo(row.original.id,
              (document.getElementById(`car${row.original.id}`) as HTMLInputElement)?.value,
              (document.getElementById(`driver${row.original.id}`) as HTMLInputElement)?.value);
            if (response.message)
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
  }, [formState]);

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