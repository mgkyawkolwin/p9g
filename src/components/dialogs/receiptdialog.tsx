"use client"

import * as React from "react";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { roomChargeGetListById } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner";
import ReceiptTable from "../tables/receipttable";
import RoomCharge from "@/core/domain/models/RoomCharge";
import Reservation from "@/core/domain/models/Reservation";
import { getReservation } from "@/app/(private)/console/reservations/[id]/edit/actions";
import { useReactToPrint } from 'react-to-print';


interface DataTableProps{
  reservationId: string;
  callbackFunctions:(func: {
    openDialog: (open: boolean) => void;
  }) => void;
}

export default function ReceiptDialog({
  reservationId,
  callbackFunctions
}: DataTableProps) {

  const receiptRef = React.useRef(undefined);

  const [open, setOpen] = React.useState(false);
  const [reservation, setReservation] = React.useState<Reservation>(undefined);
  const [roomCharges, setRoomCharges] = React.useState<RoomCharge[]>([]);

  const openDialog = (open: boolean) => {
    setOpen(open);
  };


  React.useEffect(() => {
    if(callbackFunctions){
      callbackFunctions({openDialog});
    }
  }, [callbackFunctions]);


  React.useEffect(() => {
    if(!reservationId || reservationId === 'undefined') return;
    if(!open) return;
    //reset
    setRoomCharges([]);
    const fetchData = async () => {
        // setId(reservationId);
        const response = await roomChargeGetListById(reservationId);
        
        if(response.message)
            toast(response.message);
        if(response.data){
          const b : RoomCharge[] = response.data.map((roomCharge : RoomCharge) => (
            {
              ...roomCharge, 
              startDate:new Date(roomCharge.startDate), 
              endDate:new Date(roomCharge.endDate)
            }
          ));
          setRoomCharges(b);
        }
        const r = await getReservation(reservationId);
        if(r.message)
            toast(r.message);
        if(r.data){
            setReservation(r.data.reservation as unknown as Reservation);
        }
    };
    fetchData();

  },[reservationId, open]);

  const handlePrint = useReactToPrint({
    bodyClass: "p-8 m-8",
    contentRef: receiptRef,
  });

  if(!reservation) return;
  if(!roomCharges) return;

  return (
      <Dialog open={open} onOpenChange={setOpen} >
          <DialogContent className="flex flex-col min-h-[80vh] min-w-[90vw] ">
            <DialogHeader>
              <DialogTitle>Payments</DialogTitle>
            </DialogHeader>
              <div ref={receiptRef} id="printable-receipt" className="flex w-auto">
              <ReceiptTable reservation={reservation} roomCharges={roomCharges}/>
              </div>
            <DialogFooter>
            <ButtonCustom type="button" onClick={handlePrint}>Print Receipt</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom type="button" variant="black" onClick={() => {
                  
                  setOpen(false); // Close the dialog after printing
                }}>Close</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}