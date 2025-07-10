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
import Room from "@/domain/models/Room"




interface DataTableProps<TData, TValue> {
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function RoomChangeListTable<TData, TValue>({
  formState,
  formAction,
  formRef
}: DataTableProps<TData, TValue>) {
  c.i('Client > CheckInListTable');
  c.d(JSON.stringify(formState));

  const router = useRouter();

  const columns: ColumnDef<Room>[] = [
    {
      accessorKey: "roomNo",
      header: "Room",
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
                // const action = document.createElement('input');
                // action.type = 'hidden';
                // action.name = 'actionVerb';
                // action.value = actionVerb;
                // formRef?.current?.appendChild(action);
                // const cancelIdInput = document.createElement('input');
                // cancelIdInput.type = 'hidden';
                // cancelIdInput.name = 'cancelId';
                // cancelIdInput.value = cancelId;
                // formRef?.current?.appendChild(cancelIdInput);
                setActionVerb('CANCEL');
                await formRef.current?.requestSubmit();
                setActionVerb('');
                setCancelId('');
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
                setActionVerb('CHECKIN');
                // const action = document.createElement('input');
                // action.type = 'hidden';
                // action.name = 'actionVerb';
                // action.value = actionVerb;
                // formRef?.current?.appendChild(action);
                // const checkInIdInput = document.createElement('input');
                // checkInIdInput.type = 'hidden';
                // checkInIdInput.name = 'checkInId';
                // checkInIdInput.value = checkInId;
                // formRef?.current?.appendChild(checkInIdInput);
                await formRef.current?.requestSubmit();
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
      <input type="hidden" name="actionVerb" value={actionVerb} />
      <input type="hidden" name="cancelId" value={cancelId} />
      <input type="hidden" name="checkInId" value={checkInId} />
    </>
  )
}