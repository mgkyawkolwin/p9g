"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "./datatable";
import c from "@/lib/core/logger/ConsoleLogger"
import { FormState } from "@/lib/types"
import { useRouter } from "next/navigation"
import Reservation from "@/domain/models/Reservation";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import BillEditDialog from "../dialogs/billeditdialog"
import BillDialog from "../dialogs/billdialog";
import PaymentDialog from "../dialogs/paymentdialog";
import ReceiptDialog from "../dialogs/receiptdialog";


interface DataTableProps{
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function ReservationListTable({
  formState,
  formAction,
  formRef
}: DataTableProps) {
  c.i('Client > ReservationListTable');
  c.d(JSON.stringify(formState));

  const router = useRouter();

  const receiptDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void} | undefined>(undefined);
  const paymentDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void} | undefined>(undefined);
  const editDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void} | undefined>(undefined);
  const viewDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void} | undefined>(undefined);

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
        return <span>
          {row.arrivalDateTimeUTC ? new Date(row.arrivalDateTimeUTC).toLocaleString('sv-SE') : ''} {row.pickUpTypeText}<br />
          {row.departureDateTimeUTC ? new Date(row.departureDateTimeUTC).toLocaleString('sv-SE') : ''} {row.dropOffTypeText}</span>;
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
        return <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
            receiptDialogCallbackFunc.current?.openDialog(true);
            setReservationId(row.original.id);
            
          }}>Receipt</ButtonCustom>
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
              paymentDialogCallbackFunc.current?.openDialog(true);
              setReservationId(row.original.id);
              
            }}>Payment</ButtonCustom>
          </div>
          <div className="flex gap-1">
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
            editDialogCallbackFunc.current?.openDialog(true);
            setReservationId(row.original.id);
            
          }}>Add Bill</ButtonCustom>
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
              viewDialogCallbackFunc.current?.openDialog(true);
              setReservationId(row.original.id);
              
            }}>View Bill</ButtonCustom>
          </div>
          <div className="flex gap-1">
          <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
            router.push(`/console/reservations/${row.original.id}/edit`);
          }} >Edit</ButtonCustom>
          <ButtonCustom type="button" variant={"red"} size={"sm"} onClick={() => {
            setCancelId(row.original.id);
            setOpenDialog(true);
          }}>Cancel</ButtonCustom>
          </div>
        </div>
      }
    },
  ];

  const [openDiallog, setOpenDialog] = React.useState(false);
  const [cancelId, setCancelId] = React.useState<string>('');
  const [reservationId, setReservationId] = React.useState('');

  return (
    <>
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      <section className="flex">
        <Dialog open={openDiallog} onOpenChange={setOpenDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>Confirm!</DialogTitle>
              <DialogDescription>Are you sure you want to cancel the reservation?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"red"} type="button" onClick={async () => {
                setOpenDialog(false);
                const action = document.createElement('input');
                action.type = 'hidden';
                action.name = 'actionVerb';
                action.value = 'CANCEL';
                formRef?.current?.appendChild(action);
                const cancelIdInput = document.createElement('input');
                cancelIdInput.type = 'hidden';
                cancelIdInput.name = 'cancelId';
                cancelIdInput.value = cancelId;
                formRef?.current?.appendChild(cancelIdInput);
                await formRef.current?.requestSubmit();
              }}>Yes</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  setCancelId('');
                  setOpenDialog(false);
                }}>No</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      <ReceiptDialog reservationId={reservationId} callbackFunctions={(func) => {receiptDialogCallbackFunc.current = func}} />
      <PaymentDialog reservationId={reservationId} callbackFunctions={(func) => {paymentDialogCallbackFunc.current = func}} />
      <BillEditDialog reservationId={reservationId} callbackFunctions={(func) => {editDialogCallbackFunc.current = func}} />
      <BillDialog reservationId={reservationId} callbackFunctions={(func) => {viewDialogCallbackFunc.current = func}} />
    </>
  )
}