"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "./datatable";
import c from "@/lib/core/logger/ConsoleLogger";
import { FormState } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ButtonCustom } from "../uicustom/buttoncustom";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { InputCustom } from "../uicustom/inputcustom";
import { moveRoom } from "@/app/(private)/console/roomchange/actions";
import { toast } from "sonner";
import Room from "@/domain/models/Room";
import SimpleDataTable from "./simpledatatable";


interface DataTableProps {
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}


export default function RoomChangeListTable({
  formState,
  formAction,
  formRef
}: DataTableProps) {
  c.i('Client > RoomChangeListTable');
  c.d(JSON.stringify(formState));

  const columns: ColumnDef<Room>[] = [
    {
      accessorKey: "roomNo",
      header: "Room",
    },
    {
      accessorKey: "roomTypeText",
      header: "Room Type",
    },
    {
      accessorKey: "reservations[0].id",
      header: "Reservation Id",
      accessorFn: (row) => {return  row.reservations.length > 0 ? row.reservations[0].id : ''}
    },
    {
      accessorKey: "checkInDateUTC",
      header: "Check-In",
      accessorFn: (row) => {return  row.reservations.length > 0 ? new Date(row.reservations[0].checkInDateUTC!).toLocaleDateString('sv-SE') : ''}
    },
    {
      accessorKey: "checkOutDateUTC",
      header: "Check-Out",
      accessorFn: (row) => {return  row.reservations.length > 0 ? new Date(row.reservations[0].checkOutDateUTC!).toLocaleDateString('sv-SE') : ''}
    },
    {
      accessorKey: "noOfDays",
      header: "Days",
      accessorFn: (row) => {return  row.reservations.length > 0 ? row.reservations[0].noOfDays : ''}
    },
    {
      accessorKey: "noOfGuests",
      header: "No. of Guests",
      accessorFn: (row) => {return  row.reservations.length > 0 ? row.reservations[0].noOfGuests : ''}
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex gap-1">
          <ButtonCustom type="button" variant={"black"} size={"sm"} 
          disabled={!row.original.reservations || row.original.reservations.length <= 0}
          onClick={() => {
            setReservationId(row.original.reservations[0].id);
            setOpenMoveRoomDialog(true);
            }}>Move Room</ButtonCustom>
        </div>
      }
    },
  ];

  const router = useRouter();
  const [openMoveRoomDiallog, setOpenMoveRoomDialog] = React.useState(false);
  const [reservationId, setReservationId] = React.useState<string>('');
  const [roomNo, setRoomNo] = React.useState('');
  

  React.useEffect(() => {
    setReservationId('');
    setRoomNo('');
  },[formState]);

  React.useEffect(() => {
    formRef.current?.requestSubmit();
  },[]);

  return (
    <>
      <SimpleDataTable columns={columns} data={formState.data} />
      <section className="flex">
        <Dialog key={'moveroomdialog'} open={openMoveRoomDiallog} onOpenChange={setOpenMoveRoomDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>MOVE ROOM</DialogTitle>
              <DialogDescription>
                Please enter room number to move. <br/><br/>
                <InputCustom onBlur={(e) => setRoomNo(e.target.value)}/>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"red"} type="button" onClick={async () => {
                setOpenMoveRoomDialog(false);
                const response = await moveRoom(reservationId, roomNo);
                if(response.error)
                  toast(response.message);
                else
                  window.location.href = '/console/roomchange';
              }}>Move</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  setOpenMoveRoomDialog(false);
                }}>Cancel</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      <input type="hidden" name="date" value={new Date().toISOString()} />
    </>
  )
}