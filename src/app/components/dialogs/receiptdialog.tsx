"use client"

import * as React from "react";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog"
import { roomChargeGetListById } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner";
import ReceiptTable from "../tables/receipttable";
import RoomCharge from "@/core/models/domain/RoomCharge";
import Reservation from "@/core/models/domain/Reservation";
import { getReservation } from "@/app/(private)/console/reservations/[id]/edit/actions";


interface DataTableProps {
  reservationId: string;
  callbackFunctions: (func: {
    openDialog: (open: boolean) => void;
  }) => void;
}

export default function ReceiptDialog({
  reservationId,
  callbackFunctions
}: DataTableProps) {

  const formatter = new Intl.NumberFormat('en-US', {
    style: "decimal"
  });

  const [open, setOpen] = React.useState(false);
  const [reservation, setReservation] = React.useState<Reservation>(undefined);
  const [roomCharges, setRoomCharges] = React.useState<RoomCharge[]>([]);

  const openDialog = (open: boolean) => {
    setOpen(open);
  };


  React.useEffect(() => {
    if (callbackFunctions) {
      callbackFunctions({ openDialog });
    }
  }, [callbackFunctions]);


  React.useEffect(() => {
    if (!reservationId || reservationId === 'undefined') return;
    if (!open) return;

    setRoomCharges([]);
    const fetchData = async () => {
      const response = await roomChargeGetListById(reservationId);

      if (response.message)
        toast(response.message);
      if (response.data) {
        const b: RoomCharge[] = response.data.map((roomCharge: RoomCharge) => (
          {
            ...roomCharge,
            startDate: new Date(roomCharge.startDate),
            endDate: new Date(roomCharge.endDate)
          }
        ));
        setRoomCharges(b);
      }
      const r = await getReservation(reservationId);
      if (r.message)
        toast(r.message);
      if (r.data) {
        setReservation(r.data.reservation as unknown as Reservation);
      }
    };
    fetchData();

  }, [reservationId, open]);

  const handlePrint = () => {
    let content = `<table style="width:100%;border-collapse: collapse;font-size:10pt;">`;
    content += `<thead><tr>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: left; background-color: #eee;">Description</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: left; background-color: #eee;">Start</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: left; background-color: #eee;">End</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">Rate</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">Pax</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">Days</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">Amount</th>` +
      `</tr></thead><tbody>`;

    roomCharges.forEach((charge, index) => {
      const roomRate = reservation.prepaidPackageId ? charge.seasonSurcharge : charge.roomRate;
      if (charge.roomRate > 0) {
        content += `<tr>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">Room Charge ${charge.roomNo}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${charge.startDate.toISOFormatDateString()}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${charge.endDate.toISOFormatDateString()}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${formatter.format(charge.roomRate)}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${reservation.noOfGuests}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${charge.noOfDays}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${formatter.format(charge.noOfDays * charge.roomRate * reservation.noOfGuests)}</td>` +
          `</tr>`;
      }

      if (charge.seasonSurcharge >= 0 && reservation.prepaidPackageId) {
        content += `<tr>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">Room (Season Extra Charge) - ${charge.roomNo}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${charge.startDate.toISOFormatDateString()}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${charge.endDate.toISOFormatDateString()}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${formatter.format(charge.seasonSurcharge)}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${reservation.noOfGuests}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${charge.noOfDays}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${formatter.format(charge.noOfDays * charge.seasonSurcharge * reservation.noOfGuests)}</td>` +
          `</tr>`;
      }

      if (charge.roomSurcharge > 0) {
        content += `<tr>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">Room Extra Charge ${charge.roomNo}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${charge.startDate.toISOFormatDateString()}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${charge.endDate.toISOFormatDateString()}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${formatter.format(charge.roomSurcharge)}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${reservation.noOfGuests}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${charge.noOfDays}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${formatter.format(charge.noOfDays * charge.roomSurcharge * reservation.noOfGuests)}</td>` +
          `</tr>`;
      }

      if (charge.singleRate > 0) {
        content += `<tr>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">Single Charge ${charge.roomNo}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${charge.startDate.toISOFormatDateString()}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${charge.endDate.toISOFormatDateString()}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${formatter.format(charge.singleRate)}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${reservation.noOfGuests}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${charge.noOfDays}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${formatter.format(charge.noOfDays * charge.singleRate)}</td>` +
          `</tr>`;
      }
    });
    let pickUpPrinted = false;
    let dropOffPrinted = false;
    reservation?.bills?.forEach((bill, index) => {
      if(bill.paymentType === 'PICKUP') {
        pickUpPrinted = true;
      } 
      if(bill.paymentType === 'DROPOFF') {
        dropOffPrinted = true;
      }
      if (bill.paymentType === 'PICKUP' || bill.paymentType === 'DROPOFF') {
        content += `<tr>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${bill.paymentType} - ${bill.amount} ${bill.currency}</td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `</tr>`;
      }
    });
    if(!pickUpPrinted){
      content += `<tr>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">PICKUP - </td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `</tr>`;
    }
    if(!dropOffPrinted){
      content += `<tr>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;">DROPOFF - </td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: left;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `<td style="border: 1px solid #666; padding: 8px; text-align: right;"></td>` +
          `</tr>`;
    }
    content += `</tbody><tfoot>` +
      `<tr><td colspan="6" style="padding: 8px; text-align: right; font-weight:bold;">Total</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${formatter.format(reservation.totalAmount)}</td></tr>` +
      `<tr><td colspan="6" style="padding: 8px; text-align: right; font-weight:bold;">Deposit</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${formatter.format(reservation.depositAmount)}</td></tr>` +
      `<tr><td colspan="6" style="padding: 8px; text-align: right; font-weight:bold;">Discount</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${formatter.format(reservation.discountAmount)}</td></tr>` +
      `<tr><td colspan="6" style="padding: 8px; text-align: right; font-weight:bold;">Tax (${reservation.tax}%)</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${formatter.format(reservation.taxAmount)}</td></tr>` +
      `<tr><td colspan="6" style="padding: 8px; text-align: right; font-weight:bold;">Net Total</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${formatter.format(reservation.netAmount)}</td></tr>` +
      `<tr><td colspan="6" style="padding: 8px; text-align: right; font-weight:bold;">Paid Amount</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${formatter.format(reservation.paidAmount)}</td></tr>` +
      `<tr><td colspan="6" style="padding: 8px; text-align: right; font-weight:bold;">Due Amount</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${formatter.format(reservation.dueAmount)}</td></tr>` +
      `</tfoot></table>`;

    const win = window.open('', 'Print', `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`);
    if (win) {
      win.document.open();
      win.document.writeln(
        `<html><style>@media print{ @page {margin:0;}}</style>` +
        `<body style="padding:0.5in;font-size:10pt;"><div><img src="/p9glogowithtext.png" style="width:200px;" /></div>` +
        `<div style="display:block;width:100%;text-align:center;font-size:18pt;">Receipt</div><br/><br/>` +
        `<table style="width:100%;font-size:10pt;"><tr><td>Customer: ${reservation?.customers?.reduce((acc, c) => acc + (acc ? ", " : "") + (c.englishName && c.englishName?.trim() !== "" ? c.englishName : c.name), "")}</td><td style="text-align:right;">Date: ____/____/________</td></tr></table>` +
        `<div><br/>${content}</div><br/><br/><br/><div style="width:100%;text-align:right;">Cashier Singature : ____________________</div><br/>` +
        `<div style="display:block;width:100%;align:middle;"><img src="/p9gqr.png" style="width:350px;" /></div></body></html>`
      );
      win.document.close();
      win.focus();
      win.onload = function () {
        win.print();
        win.close();
      }
    }
  };

  if (!reservation) return;
  if (!roomCharges) return;

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogContent className="flex flex-col min-h-[80vh] min-w-[90vw] ">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div id="printable-receipt" className="flex w-auto overflow-auto">
          <ReceiptTable reservation={reservation} roomCharges={roomCharges} />
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