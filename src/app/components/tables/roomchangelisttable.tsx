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
import { moveRoom, updateFeedback, updateGolfCart } from "@/app/(private)/console/roomchange/actions";
import { toast } from "sonner";
import SimpleDataTable from "../../../lib/components/web/react/uicustom/simpledatatable";
import { CopyIcon, NotepadText, Image } from "lucide-react";
import RoomReservationDto from "@/core/models/dto/RoomReservationDto";
import FeedbackDialog from "../dialogs/feedbackdialog";
import Feedback from "@/core/models/domain/Feedback";
import MediaDialog from "../dialogs/mediadialog";
import Media from "@/core/models/domain/Media";
import { Label } from "@/lib/components/web/react/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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
      accessorFn: row => <div>{row.reservationId ? String(row.reservationId).substring(0, 8) : ""}&nbsp;&nbsp;&nbsp;{row.reservationId && <CopyIcon className="inline w-[20px] cursor-pointer" onClick={e => navigator.clipboard.writeText(row.reservationId)} />}</div>,
      cell: (row) => row.getValue()
    },
    {
      accessorKey: "customers",
      header: "Customers",
      cell: (row) => {
        return row.row.original.customers.map(c => {
          return <div className="flex flex-row gap-2" key={c.id}>
            {c.englishName}
            <NotepadText className={`pointer ${c.feedback?.feedback ? "text-red-800" : ""}`} onClick={() => { setReservationId(row.row.original.reservationId); setCustomerId(c.id); setFeedback(c.feedback?.feedback); setFeedbackDialogOpen(true); }} />
            <Image className={`pointer ${c.medias?.length > 0 ? "text-red-800" : ""}`} onClick={() => { setReservationId(row.row.original.reservationId); setCustomerId(c.id); setInitialMedia(c.medias); setOpenMediaDialog(true); }} />
          </div>
        })
      },
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
      header: "Pax"
    },
    {
      accessorKey: "golfCart",
      header: "Golf Cart",
      cell: ({ row }) => <InputCustom variant="table" size="sm" id={`${row.original.roomNo}:${row.original.reservationId}:${row.original.customers.map(c => c.englishName).join('')}`}
        defaultValue={String(row.original.golfCart ?? '')}
        onBlur={() => {
          updateGolfCartLocal(row.original.reservationId, (document.getElementById(`${row.original.roomNo}:${row.original.reservationId}:${row.original.customers.map(c => c.englishName).join('')}`) as HTMLInputElement).value);
        }} />,
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
  const [customerId, setCustomerId] = React.useState<string>('');
  const [initialMedia, setInitialMedia] = React.useState<Media[]>([]);
  const [openMediaDialog, setOpenMediaDialog] = React.useState<boolean>(false);
  const [openMoveRoomDiallog, setOpenMoveRoomDialog] = React.useState(false);
  const [reservationId, setReservationId] = React.useState<string>('');
  const [feedback, setFeedback] = React.useState<string>('');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = React.useState<boolean>(false);
  const [roomNo, setRoomNo] = React.useState('');
  const [data, setData] = React.useState<RoomReservationDto[]>(formState.data || []);
  const [date, setDate] = React.useState<Date | null>(new Date());

  async function updateGolfCartLocal(reservationId: string, golfCart: string) {
    const response = await updateGolfCart(reservationId, golfCart);
    if (response.message)
      toast(response.message);
    if (response.error) return;

    const updatedData = data.map(item => {
      if (item.reservationId === reservationId) {
        return { ...item, golfCart: golfCart };
      }
      return item;
    });
    setData(updatedData);
  }


  React.useEffect(() => {
    setReservationId('');
    setRoomNo('');
    setData(formState.data || []);
  }, [formState]);

  React.useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <>
      <section aria-label="Reservatoin List Search" className="flex w-full flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Label>Date</Label>
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => {
              setDate(date)
            }}
            dateFormat="yyyy-MM-dd"
            customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
            placeholderText="yyyy-mm-dd"
            isClearable={true}
            showIcon
          />
          <ButtonCustom onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
          <input type="hidden" name="date" defaultValue={date ? date.toISOFormatDateString() : ''} />
        </div>
      </section>
      <SimpleDataTable columns={columns} data={data} />
      <section className="flex">
        <Dialog key={'moveroomdialog'} open={openMoveRoomDiallog} onOpenChange={setOpenMoveRoomDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>MOVE ROOM</DialogTitle>
              <DialogDescription>
                Please enter room number to move. <br /><br />
                <InputCustom onBlur={(e) => setRoomNo(e.target.value)} />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"red"} type="button" onClick={async () => {
                setOpenMoveRoomDialog(false);
                const response = await moveRoom(reservationId, roomNo, new Date().getLocalDateAsUTCDate());
                if (response.error)
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
      <FeedbackDialog isOpen={feedbackDialogOpen} reservationId={reservationId} initialFeedback={feedback}
        onOpenChanged={() => setFeedbackDialogOpen(false)}
        onFeedbackSaved={async (reservationId: string, feedback: string) => {
          const response = await updateFeedback(reservationId, customerId, feedback);
          if (response.message)
            toast(response.message);
          if (response.error) return;

          const updatedData = data.map(item => {
            if (item.reservationId === reservationId) {
              item.customers = item.customers.map(c => {
                if (c.id === customerId) {
                  const fb = new Feedback();
                  fb.feedback = feedback;
                  fb.customerId = customerId;
                  fb.reservationId = reservationId;
                  return { ...c, feedback: fb };
                }
                return c;
              });
            }
            return item;
          });
          setData(updatedData);
          setFeedbackDialogOpen(false);
        }} title="Feedback" description="Customer feedback form, complaints & complements" />

      <MediaDialog isOpen={openMediaDialog}
        reservationId={reservationId}
        customerId={customerId}
        initialMedia={initialMedia}
        allowedFileTypes={['image/*', 'video/*', 'application/pdf', 'text/plain']}
        onOpenChanged={() => setOpenMediaDialog(false)}
        onMediaSaved={(reservationId, customerId, uploadedFiles) => {
          const updatedData = data.map(item => {
            if (item.reservationId === reservationId) {
              item.customers = item.customers.map(c => {
                if (c.id === customerId) {
                  return { ...c, medias: uploadedFiles };
                }
                return c;
              });
            }
            return item;
          });
          setData(updatedData);
        }}
      />
      {/* <input type="hidden" name="date" value={new Date().toISOFormatDateString()} /> */}
    </>
  )
}