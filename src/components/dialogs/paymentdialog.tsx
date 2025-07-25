"use client"

import * as React from "react";

import {
  ColumnDef
} from "@tanstack/react-table";
import c from "@/lib/core/logger/ConsoleLogger";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { paymentsDelete, paymentsGet, paymentsSave } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner";
import { InputCustom } from "../uicustom/inputcustom"
import { SelectCustom } from "../uicustom/selectcustom"
import { SelectList } from "@/lib/constants"
import BillDataTable from "../uicustom/billdatatable"
import { DatePickerCustom } from "../uicustom/datepickercustom";
import { DateInputWithLabel } from "../uicustom/dateinputwithlabel";
import Payment from "@/domain/models/Payment";


interface DataTableProps{
  reservationId: string;
  callbackFunctions:(func: {
    openDialog: (open: boolean) => void;
  }) => void;
}

export default function PaymentDialog({
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
  // const [id, setId] = React.useState<string>(reservationId);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [reloadDataToggle, setReloadDataToggle] = React.useState(false);

  const openDialog = (open: boolean) => {
    setOpen(open);
  };


  React.useEffect(() => {
    if(callbackFunctions){
      callbackFunctions({openDialog});
    }
  }, [callbackFunctions]);



  const handleInputChange = (rowIndex:number, field:string, value:string|Date|boolean|undefined, compute:boolean = false) => {
    if(compute)
      setPayments(prev => 
        prev.map((payment, index) => 
          index === rowIndex ? { ...payment, [field]: value } : payment
        )
      );
    else{
      c.d(payments);
      setPayments(prev => 
        prev.map((bill, index) => 
          index === rowIndex ? { ...bill, [field]: value } : bill
        )
      );
      c.d(payments);
    }
};

  const columns = React.useMemo<ColumnDef<Payment>[]>(() =>  [
      {
        accessorKey: "index",
        header: "#",
        accessorFn: (row, index) => {
          return index+1;
        },
        cell: row => (row.getValue())
      },
      {
        accessorKey: "paymentDateUTC",
        header: 'Payment Date',
        cell: (row) => <DateInputWithLabel type="date" label="" key={`${row.row.original.id}-paymentDateUTC`} 
        value={new Date(row.row.original.paymentDateUTC).toLocaleDateString('sv-SE')} 
        onChange={(e) => {
          if(e.target.value){
            c.d(e.target.value);
            handleInputChange(row.row.index,"paymentDateUTC",new Date(e.target.value).toISOString());
          }
            
        }} />
      },
      {
        accessorKey: "amount",
        header: 'Amount',
        cell: (row) => <InputCustom size={"sm"} key={`${row.row.original.id}-amount`} // Crucial for maintaining focus
        value={row.row.original.amount}
        onChange={e => {
          handleInputChange(row.row.index,"amount",e.target.value);
        }}/>
      },
      {
        accessorKey: "amountInCurrency",
        header: 'Amount in Currency',
        cell: (row) => <InputCustom size={"sm"} key={`${row.row.original.id}-amountInCurrency`} // Crucial for maintaining focus
        value={row.row.original.amountInCurrency}
        onChange={e => {
          handleInputChange(row.row.index,"amountInCurrency",e.target.value);
        }} />
      },
      {
        accessorKey: "currency",
        header: 'Currency',
        cell: row => {
          return <SelectCustom name={`currency[${row.row.index}]`} key={`${row.row.original.id}-currency`} // Crucial for maintaining focus
          size={"sm"} items={SelectList.CURRENCY} 
          value={row.row.original.currency} 
          onValueChange={value => handleInputChange(row.row.index,"currency", value)} />
        }
      },
      {
        accessorKey: "paymentMode",
        header: 'Payment Mode',
        cell: row => {
          return <SelectCustom name={`paymentMode[${row.row.index}]`} key={`${row.row.original.id}-paymentMode`} // Crucial for maintaining focus
          size={"sm"} items={SelectList.PAYMENT_MODE} 
          value={row.row.original.paymentMode} 
          onValueChange={value => handleInputChange(row.row.index,"paymentMode", value)} />
        }
      },
      {
        accessorKey: "remark",
        header: 'Remark',
        cell: (row) => <InputCustom size={"sm"} key={`${row.row.original.id}-remark`} // Crucial for maintaining focus
        value={row.row.original.remark}
        onChange={e => {
          handleInputChange(row.row.index,"remark",e.target.value);
        }} />
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: (row) => {
          return <div>
            {getActionButton(row.row.original.id, row.row.original.reservationId, row.row.index)}
          </div>
        }
      },
    ], []);

  React.useEffect(() => {
    if(!reservationId || reservationId === 'undefined') return;
    if(!open) return;
    //reset
    setPayments([]);
    const fetchPayments = async () => {
        // setId(reservationId);
        const response = await paymentsGet(reservationId);
        c.d(response.data);
        if(response.message)
            toast(response.message);
        if(response.data){
          const b = response.data.map(payment => (
            {
              ...payment, 
              paymentDateUTC:new Date(payment.paymentDateUTC)
            }
          ));
          setPayments(b);
        }
    };
    fetchPayments();

  },[reservationId, open, reloadDataToggle]);

  function getActionButton(id:string|undefined, reservationId: string, rowIndex: number){
    if(id && id.trim().length != 0){
        return <ButtonCustom type="button" variant={"red"} size={"sm"}
    onClick={async () => {
      const result = await paymentsDelete(reservationId,id);
      if(result.message) toast(result.message);
      if(!result.error) setPayments(prev => prev.filter((bill, index) => index !== rowIndex));
    }}>Delete</ButtonCustom>;
  }else{
      return <ButtonCustom type="button" variant={"black"} size={"sm"}
    onClick={() => {
      setPayments(prev => prev.filter((bill, index) => index !== rowIndex));
    }}>Remove</ButtonCustom>;
  }
  }

  return (
      <Dialog open={open} onOpenChange={setOpen} >
          <DialogContent className="flex flex-col min-h-[80vh] min-w-[90vw] ">
            <DialogHeader>
              <DialogTitle>Payments</DialogTitle>
            </DialogHeader>
              <div className="flex flex-1">
              <BillDataTable columns={columns} data={payments} />
              </div>
            <DialogFooter>
            <ButtonCustom type="button" onClick={async () => {
              const response = await paymentsSave(reservationId, payments);
              toast(response.message);
              if(!response.error)
                setOpen(false);
            }}>Save Payment</ButtonCustom>
            <ButtonCustom type="button" onClick={() => {
                setPayments(prev => [...prev, {...new Payment(), reservationId}]);
            }}>Add Row</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom type="button" variant="black" onClick={() => {
                  
                }}>Close</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}