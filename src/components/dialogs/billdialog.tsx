"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { billsView } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner"
import Bill from "@/domain/models/Bill"
import BillDataTable from "../uicustom/billdatatable"
import TotalTable from "../tables/totaltable";
import Invoice from "@/domain/dtos/Invoice";


interface DataTableProps{
  reservationId: string;
  callbackFunctions:(func: {
    openDialog: (open: boolean) => void;
  }) => void;
}

export default function BillDialog({
  reservationId,
  callbackFunctions
}: DataTableProps) {

  const [open, setOpen] = React.useState(false);
  // const [id, setId] = React.useState<string>(reservationId);
  const [invoice, setInvoice] = React.useState<Invoice>(new Invoice());

  const openDialog = (open: boolean) => {
    setOpen(open);
  };


  React.useEffect(() => {
    if(callbackFunctions){
      callbackFunctions({openDialog});
    }
  }, [callbackFunctions]);



  const columns = React.useMemo<ColumnDef<Bill>[]>(() =>  [
      {
        key: `key${Math.random()}`,
        accessorKey: "index",
        header: "#",
        accessorFn: (row, index) => {
          return index+1;
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
    if(!reservationId || reservationId === 'undefined') return;
    if(!open) return;
    //reset
    //setInvoice([]);
    const fetchInvoice = async () => {
        // setId(reservationId);
        const response = await billsView(reservationId);
        if(response.message)
            toast(response.message);
        if(response.data){
          const i : Invoice = response.data;
          i.PaidBills = i.PaidBills ? i.PaidBills?.map((bill : Bill) => (
            {
              ...bill, 
              dateUTC:new Date(bill.dateUTC),
              paidOnUTC: bill.paidOnUTC ? new Date(bill.paidOnUTC) : undefined
            }
          )) as unknown as Bill[] : [];
          i.UnPaidBills = i.UnPaidBills ? i.UnPaidBills?.map((bill : Bill) => (
            {
              ...bill, 
              dateUTC:new Date(bill.dateUTC),
              paidOnUTC: bill.paidOnUTC ? new Date(bill.paidOnUTC) : undefined
            }
          )) as unknown as Bill[] : [];
          setInvoice(response.data);
        }
            
    };
    fetchInvoice();

  },[reservationId, open]);

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
                    <BillDataTable columns={columns} data={invoice.PaidBills} />
                    </div>
                    <div className="grid grid-col-3 place-content-end">
                      <TotalTable items={invoice.PaidTotals}/>
                    </div>
                </div>
                <div className="flex  flex-col flex-gap-4">
                    <div className="flex text-[21pt] text-weight-bold text-center">Un-Paid</div>
                    <div className="flex">
                    <BillDataTable columns={columns} data={invoice.UnPaidBills} />
                    </div>
                    <div className="grid grid-col-3 place-content-end">
                      <TotalTable items={invoice.UnPaidTotals}/>
                    </div>
                </div>
              </div>
            <DialogFooter>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  
                }}>Close</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}