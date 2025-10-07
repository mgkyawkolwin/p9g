"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import { FormState } from "@/core/types";
import { useRouter } from "next/navigation";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";
import { moveRoom } from "@/app/(private)/console/roomchange/actions";
import { toast } from "sonner";
import SimpleDataTable from "../../../lib/components/web/react/uicustom/simpledatatable";
import { CopyIcon } from "lucide-react";
import RoomReservationDto from "@/core/models/dto/RoomReservationDto";


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

  const columns: ColumnDef<RoomReservationDto>[] = [
    {
      accessorKey: "roomNo",
      header: "Room",
    },
    {
      accessorKey: "roomTypeText",
      header: "Room Type",
    },
    {
      accessorKey: "reservationId",
      header: "Reservation Id",
      accessorFn: row => <div>{row.reservationId}&nbsp;&nbsp;&nbsp;{row.reservationId && <CopyIcon className="inline w-[20px] cursor-pointer" onClick={e => navigator.clipboard.writeText(row.reservationId)} />}</div>,
      cell: (row) => row.getValue()
    },
    {
      accessorKey: "customers",
      header: "Customers",
      accessorFn: (row) => <div>{row.customers ? row.customers.map(c => c.englishName).join(', ') : 0}</div>,
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "checkInDate",
      header: "Check-In",
      accessorFn: row => row.checkInDate ? row.checkInDate.substring(0, 10) : ''
    },
    {
      accessorKey: "checkOutDate",
      header: "Check-Out",
      accessorFn: row => row.checkOutDate ? row.checkOutDate.substring(0, 10) : ''
    },
    {
      accessorKey: "noOfDays",
      header: "Days"
    },
    {
      accessorKey: "noOfGuests",
      header: "No. of Guests"
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex gap-1">
          <ButtonCustom type="button" variant={"black"} size={"sm"} 
          disabled={!row.original.reservationId}
          onClick={() => {
            setReservationId(row.original.reservationId);
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
                const response = await moveRoom(reservationId, roomNo, new Date().getLocalDateAsUTCDate());
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
      <input type="hidden" name="date" value={new Date().toISOFormatDateString()} />
    </>
  )
}