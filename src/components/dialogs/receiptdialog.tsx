"use client"

import * as React from "react";

import {
  ColumnDef
} from "@tanstack/react-table";
import c from "@/lib/core/logger/ConsoleLogger";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { paymentsGet, paymentsSave, roomChargesGet } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner";
import { InputCustom } from "../uicustom/inputcustom"
import { SelectCustom } from "../uicustom/selectcustom"
import { SelectList } from "@/lib/constants"
import BillDataTable from "../uicustom/billdatatable"
import { DatePickerCustom } from "../uicustom/datepickercustom";
import { DateInputWithLabel } from "../uicustom/dateinputwithlabel";
import Payment from "@/domain/models/Payment";
import ReceiptTable from "../tables/receipttable";
import RoomCharge from "@/domain/models/RoomCharge";
import Reservation from "@/domain/models/Reservation";
import { getReservation } from "@/app/(private)/console/reservations/[id]/edit/actions";


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
  c.i('Client > BillEditDialog');
  c.d(reservationId);

//   const [formState, formAction, isPending] = React.useActionState(saveBills, {
//     error: false,
//     message: ''
//   });

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
        const response = await roomChargesGet(reservationId);
        c.d(response.data);
        if(response.message)
            toast(response.message);
        if(response.data){
          const b = response.data.map(roomCharge => (
            {
              ...roomCharge, 
              startDateUTC:new Date(roomCharge.startDateUTC), 
              endDateUTC:new Date(roomCharge.endDateUTC)
            }
          ));
          setRoomCharges(b);
        }
        const r = await getReservation(reservationId);
        if(r.message)
            toast(r.message);
        if(r.data){
            setReservation(r.data);
        }
    };
    fetchData();

  },[reservationId, open]);

  return (
      <Dialog open={open} onOpenChange={setOpen} >
          <DialogContent className="flex flex-col min-h-[80vh] min-w-[90vw] ">
            <DialogHeader>
              <DialogTitle>Payments</DialogTitle>
            </DialogHeader>
              <div className="flex flex-1">
              <ReceiptTable reservation={reservation} roomCharges={[]}/>
              </div>
            <DialogFooter>
            <ButtonCustom type="button" onClick={async () => {
              
            }}>Save Payment</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom type="button" variant="black" onClick={() => {
                  
                }}>Close</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}