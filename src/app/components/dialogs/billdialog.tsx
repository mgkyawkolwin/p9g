"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog"
import { getReservation, invoiceView } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner"
import Bill from "@/core/models/domain/Bill"
import BillDataTable from "../../../lib/components/web/react/uicustom/billdatatable"
import TotalTable from "../tables/totaltable";
import Invoice from "@/core/models/dto/Invoice";
import { Checkbox } from "@/lib/components/web/react/ui/checkbox";
import Reservation from "@/core/models/domain/Reservation";
import { CheckboxCustom } from "@/lib/components/web/react/uicustom/CheckboxCustom";

interface DataTableProps {
  reservationId: string;
  callbackFunctions: (func: {
    openDialog: (open: boolean) => void;
  }) => void;
}

export default function BillDialog({
  reservationId,
  callbackFunctions
}: DataTableProps) {

  const [open, setOpen] = React.useState(false);
  const [invoice, setInvoice] = React.useState<Invoice>(new Invoice());
  const [printBills, setPrintBills] = React.useState<Bill[]>([]);
  const componentRef = React.useRef(undefined);
  const [reservation, setReservation] = React.useState(undefined);

  const handlePrint = () => {
    let total = 0;
    let content = `<table style="width:100%;border-collapse: collapse;font-size:10pt;">`;
    content += `<thead><tr>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">#</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: left; background-color: #eee;">Bill Date</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: left; background-color: #eee;">Description</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">Unit Price</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">Qty</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">Cur</th>` +
      `<th style="border: 1px solid #666; padding: 8px; text-align: right; background-color: #eee;">Amount</th>` +
      `</tr></thead><tbody>`;

    printBills.forEach((bill, index) => {
      total += bill.amount || 0;
      content += `<tr>` +
        `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${index + 1}</td>` +
        `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${bill.dateUTC ? (bill.dateUTC as Date).toLocaleDateString('sv-SE') : ""}</td>` +
        `<td style="border: 1px solid #666; padding: 8px; text-align: left;">${bill.itemName}</td>` +
        `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${bill.unitPrice}</td>` +
        `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${bill.quantity}</td>` +
        `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${bill.currency}</td>` +
        `<td style="border: 1px solid #666; padding: 8px; text-align: right;">${bill.amount}</td>` +
        `</tr>`;
    });
    content += `</tbody>`;
    content += `<tfoot><tr>` +
      `<td colspan="6" style="padding: 8px; text-align: right; font-weight:bold;">Total</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${total}</td>` +
      `</tr></tfoot>`;
    content += `</table>`;

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


  const openDialog = (open: boolean) => {
    setOpen(open);
  };


  React.useEffect(() => {
    if (callbackFunctions) {
      callbackFunctions({ openDialog });
    }
  }, [callbackFunctions]);


  const paidColumns = React.useMemo<ColumnDef<Bill & { checked: boolean }>[]>(() => [
    {
      key: `key${Math.random()}`,
      accessorKey: "index",
      header: "#",
      accessorFn: (row, index) => {
        return index + 1;
      },
      cell: row => (row.getValue())
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "dateUTC",
      header: 'Bill Date',
      cell: (row) => row.getValue() ? (row.getValue() as Date).toLocaleDateString('sv-SE') : ""
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "paymentType",
      header: 'Payment Type'
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "paymentMode",
      header: 'Payment Mode'
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "itemName",
      header: 'Name',
      cell: (row) => row.getValue()
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "unitPrice",
      header: 'Unit Price',
      cell: (row) => row.getValue()
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "quantity",
      header: 'Quantity',
      cell: (row) => row.getValue()
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "amount",
      header: 'Amount',
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "currency",
      header: 'Currency',
      cell: row => {
        return row.getValue()
      }
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "paidOnUTC",
      header: 'Paid Date',
      cell: row => row.getValue() ? (row.getValue() as Date).toLocaleDateString('sv-SE') : ""
    },
    {
      accessorKey: "check",
      header: 'Print',
      cell: (row) => <CheckboxCustom key={`${row.row.original.id}-check`}
        checked={row.row.original.checked || false}
        onCheckedChange={(checked) => {
          setPrintBills(prev => checked ? [...prev, { ...row.row.original, checked: checked.valueOf() }] : prev.filter(b => b.id !== row.row.original.id));
          setInvoice(prev => {
            const updatedBills = prev.PaidBills?.map(b => {
              if (b.id === row.row.original.id) {
                return { ...b, checked: checked.valueOf() };
              }
              return b;
            });
            return { ...prev, PaidBills: updatedBills };
          });
        }}
      />
    },
  ], []);


  const unPaidColumns = React.useMemo<ColumnDef<Bill>[]>(() => [
    {
      key: `key${Math.random()}`,
      accessorKey: "index",
      header: "#",
      accessorFn: (row, index) => {
        return index + 1;
      },
      cell: row => (row.getValue())
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "dateUTC",
      header: 'Bill Date',
      cell: (row) => row.getValue() ? (row.getValue() as Date).toLocaleDateString('sv-SE') : ""
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "paymentType",
      header: 'Payment Type'
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "paymentMode",
      header: 'Payment Mode'
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "itemName",
      header: 'Name',
      cell: (row) => row.getValue()
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "unitPrice",
      header: 'Unit Price',
      cell: (row) => row.getValue()
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "quantity",
      header: 'Quantity',
      cell: (row) => row.getValue()
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "amount",
      header: 'Amount',
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "currency",
      header: 'Currency',
      cell: row => {
        return row.getValue()
      }
    },
    {
      key: `key${Math.random()}`,
      accessorKey: "paidOnUTC",
      header: 'Paid Date',
      cell: row => row.getValue() ? (row.getValue() as Date).toLocaleDateString('sv-SE') : ""
    }
  ], []);


  React.useEffect(() => {
    if (!reservationId || reservationId === 'undefined') return;
    if (!open) return;
    //reset
    setPrintBills([]);
    const fetchInvoice = async () => {
      const r = await getReservation(reservationId);
      if (r.message)
        toast(r.message);
      if (r.data) {
        setReservation(r.data.reservation as unknown as Reservation);
      }

      const response = await invoiceView(reservationId);
      if (response.message)
        toast(response.message);
      if (response.data) {
        const i: Invoice = response.data;
        i.PaidBills = i.PaidBills ? i.PaidBills?.map((bill: Bill) => (
          {
            ...bill,
            dateUTC: new Date(bill.dateUTC),
            paidOnUTC: bill.paidOnUTC ? new Date(bill.paidOnUTC) : undefined
          }
        )) as unknown as Bill[] : [];
        i.UnPaidBills = i.UnPaidBills ? i.UnPaidBills?.map((bill: Bill) => (
          {
            ...bill,
            dateUTC: new Date(bill.dateUTC),
            paidOnUTC: bill.paidOnUTC ? new Date(bill.paidOnUTC) : undefined
          }
        )) as unknown as Bill[] : [];
        setInvoice(response.data);
      }
    };
    fetchInvoice();
  }, [reservationId, open]);


  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogContent className="flex flex-col min-h-[80vh] min-w-[90vw] ">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-gap-4">
          <div className="flex  flex-col flex-gap-4">
            <div className="flex text-[21pt] text-weight-bold text-center">Paid</div>
            <div className="flex">
              <BillDataTable columns={paidColumns as ColumnDef<Bill, unknown>[]} data={invoice.PaidBills} />
            </div>
            <div className="grid grid-col-3 place-content-end">
              <TotalTable items={invoice.PaidTotals} />
            </div>
          </div>
          <div className="flex  flex-col flex-gap-4">
            <div className="flex text-[21pt] text-weight-bold text-center">Un-Paid</div>
            <div className="flex">
              <BillDataTable columns={unPaidColumns} data={invoice.UnPaidBills} />
            </div>
            <div className="grid grid-col-3 place-content-end">
              <TotalTable items={invoice.UnPaidTotals} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <ButtonCustom variant="black" onClick={() => {
            handlePrint();
          }}>Print Bill</ButtonCustom>
          <DialogClose asChild>
            <ButtonCustom variant="black" onClick={() => {

            }}>Close</ButtonCustom>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}