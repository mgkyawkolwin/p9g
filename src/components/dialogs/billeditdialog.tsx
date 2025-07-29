"use client"

import * as React from "react";

import {
  ColumnDef
} from "@tanstack/react-table";
import c from "@/lib/core/logger/ConsoleLogger";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { billDelete, billsGet, billsSave } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner"
import Bill from "@/domain/models/Bill"
import { InputCustom } from "../uicustom/inputcustom"
import { SelectCustom } from "../uicustom/selectcustom"
import { SelectList } from "@/lib/constants"
import BillDataTable from "../uicustom/billdatatable"
import { DatePickerCustom } from "../uicustom/datepickercustom";
import { DateInputWithLabel } from "../uicustom/dateinputwithlabel";
import { Checkbox } from "../ui/checkbox";


interface DataTableProps {
  reservationId: string;
  callbackFunctions: (func: {
    openDialog: (open: boolean) => void;
  }) => void;
}

export default function BillEditDialog({
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
  const [bills, setBills] = React.useState<Bill[]>([]);

  const openDialog = (open: boolean) => {
    setOpen(open);
  };


  React.useEffect(() => {
    if (callbackFunctions) {
      callbackFunctions({ openDialog });
    }
  }, [callbackFunctions]);



  const handleInputChange = (rowIndex: number, field: string, value: string | Date | boolean | undefined, compute: boolean = false) => {
    if (compute)
      setBills(prev =>
        prev.map((bill, index) =>
          index === rowIndex ? { ...bill, [field]: value, amount: bill.unitPrice && bill.quantity ? bill.unitPrice * bill.quantity : 0 } : bill
        )
      );
    else {
      c.d(bills);
      setBills(prev =>
        prev.map((bill, index) =>
          index === rowIndex ? { ...bill, [field]: value } : bill
        )
      );
      c.d(bills);
    }
  };

  const columns = React.useMemo<ColumnDef<Bill>[]>(() => [
    {
      accessorKey: "index",
      header: "#",
      accessorFn: (row, index) => {
        return index + 1;
      },
      cell: row => (row.getValue())
    },
    {
      accessorKey: "dateUTC",
      header: 'Bill Date',
      cell: (row) => <DateInputWithLabel type="date" label="" key={`${row.row.original.id}-dateUTC`}
        value={new Date(row.row.original.dateUTC).toLocaleDateString('sv-SE')}
        onChange={(e) => {
          if (e.target.value) {
            c.d(e.target.value);
            handleInputChange(row.row.index, "dateUTC", new Date(e.target.value).toISOString());
          }

        }} />
    },
    {
      accessorKey: "paymentType",
      header: 'Payment Type',
      cell: row => {
        return <SelectCustom name={`paymentType[${row.row.index}]`} key={`${row.row.original.id}-paymentType`} // Crucial for maintaining focus
          size={"sm"} items={SelectList.BILL_PAYMENT_TYPE}
          value={row.row.original.paymentType}
          onValueChange={value => handleInputChange(row.row.index, "paymentType", value)} />
      }
    },
    {
      accessorKey: "itemName",
      header: 'Name',
      cell: (row) => <InputCustom size={"sm"} key={`${row.row.original.id}-itemName`} // Crucial for maintaining focus
        value={row.row.original.itemName}
        onChange={e => {
          handleInputChange(row.row.index, "itemName", e.target.value);
        }} />
    },
    {
      accessorKey: "unitPrice",
      header: 'Unit Price',
      cell: (row) => <InputCustom size={"sm"} key={`${row.row.original.id}-unitPrice`} // Crucial for maintaining focus
        value={row.row.original.unitPrice}
        onChange={e => {
          handleInputChange(row.row.index, "unitPrice", e.target.value);
        }} onBlur={e => {
          handleInputChange(row.row.index, "unitPrice", e.target.value, true);
        }} />
    },
    {
      accessorKey: "quantity",
      header: 'Quantity',
      cell: (row) => <InputCustom size={"sm"} key={`${row.row.original.id}-quantity`} // Crucial for maintaining focus
        value={row.row.original.quantity}
        onChange={e => {
          handleInputChange(row.row.index, "quantity", e.target.value);
        }} onBlur={e => {
          handleInputChange(row.row.index, "quantity", e.target.value, true);
        }} />
    },
    {
      accessorKey: "amount",
      header: 'Amount',
    },
    {
      accessorKey: "currency",
      header: 'Currency',
      cell: row => {
        return <SelectCustom name={`currency[${row.row.index}]`} key={`${row.row.original.id}-currency`} // Crucial for maintaining focus
          size={"sm"} items={SelectList.CURRENCY}
          value={row.row.original.currency}
          onValueChange={value => handleInputChange(row.row.index, "currency", value)} />
      }
    },
    {
      accessorKey: "isPaid",
      header: 'Is Paid',
      cell: (row) => <Checkbox key={`${row.row.original.id}-isPaid`}
        checked={row.row.original.isPaid}
        onCheckedChange={(checked) => {
          handleInputChange(row.row.index, "isPaid", checked.valueOf());

        }} />
    },
    {
      accessorKey: "paidOnUTC",
      header: 'Paid Date',
      accessorFn: (row, index) => <DateInputWithLabel type="date" label="" key={`${row.id}-paidOnUTC`}
        value={row.paidOnUTC ? new Date(row.paidOnUTC).toLocaleDateString('sv-SE') : ""}
        onChange={(e) => {
          if (e.target.value) {
            c.d(e.target.value);
            handleInputChange(index, "paidOnUTC", new Date(e.target.value).toISOString());
          } else {
            handleInputChange(index, "paidOnUTC", undefined);
          }

        }} />,
      cell: row => row.getValue()
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


  function getActionButton(id: string | undefined, reservationId: string, rowIndex: number) {
    if (id && id.trim().length != 0) {
      return <ButtonCustom type="button" variant={"red"} size={"sm"}
        onClick={async () => {
          const result = await billDelete(reservationId, id);
          if (result.message) toast(result.message);
          if (!result.error) setBills(prev => prev.filter((bill, index) => index !== rowIndex));
        }}>Delete</ButtonCustom>;
    } else {
      return <ButtonCustom type="button" variant={"black"} size={"sm"}
        onClick={() => {
          setBills(prev => prev.filter((bill, index) => index !== rowIndex));
        }}>Remove</ButtonCustom>;
    }
  }


  React.useEffect(() => {
    if (!reservationId || reservationId === 'undefined') return;
    //reset
    setBills([]);
    const fetchBills = async () => {
      // setId(reservationId);
      const response = await billsGet(reservationId);
      c.d(response.data);
      if (response.message)
        toast(response.message);
      if (response.data) {
        const b = response.data.map(bill => (
          {
            ...bill,
            dateUTC: new Date(bill.dateUTC),
            paidOnUTC: bill.paidOnUTC ? new Date(bill.paidOnUTC) : undefined
          }
        ));
        setBills(b);
      }

    };
    fetchBills();

  }, [reservationId]);

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogContent className="flex flex-col min-h-[80vh] min-w-[90vw] ">
        <DialogHeader>
          <DialogTitle>Bill</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1">
          <BillDataTable columns={columns} data={bills} />
        </div>
        <DialogFooter>
          <ButtonCustom type="submit" onClick={async () => {
            const response = await billsSave(reservationId, bills);
            toast(response.message);
            if (!response.error)
              setOpen(false);
          }}>Save Bill</ButtonCustom>
          <ButtonCustom onClick={() => {
            setBills(prev => [...prev, { ...new Bill(), reservationId }]);
          }}>Add Row</ButtonCustom>
          <DialogClose asChild>
            <ButtonCustom variant="black" onClick={() => {

            }}>Close</ButtonCustom>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}