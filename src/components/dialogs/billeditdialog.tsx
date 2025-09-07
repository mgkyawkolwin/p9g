"use client"

import * as React from "react";

import {
  ColumnDef
} from "@tanstack/react-table";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { billDelete, billsGet, billsSave } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner"
import Bill from "@/core/domain/models/Bill"
import { InputCustom } from "../uicustom/inputcustom"
import { SelectCustom } from "../uicustom/selectcustom"
import { SelectList } from "@/core/lib/constants"
import BillDataTable from "../uicustom/billdatatable"
import { Checkbox } from "../ui/checkbox";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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


  const [open, setOpen] = React.useState(false);
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
      setBills(prev =>
        prev.map((bill, index) =>
          index === rowIndex ? { ...bill, [field]: value } : bill
        )
      );
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
      cell: (row) => <DatePicker key={`${row.row.original.id}-dateUTC`}
        selected={row.row.original.dateUTC}
        onChange={(date: Date | null) => {
          handleInputChange(row.row.index, "dateUTC", date);
        }}
        dateFormat="yyyy-MM-dd"
        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
        placeholderText="yyyy-mm-dd"
        isClearable={true}
        showIcon
      />
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
      accessorKey: "paymentMode",
      header: 'Mode',
      cell: row => {
        return <SelectCustom name={`paymentMode[${row.row.index}]`} key={`${row.row.original.id}-paymentMode`} // Crucial for maintaining focus
          size={"xs"} items={SelectList.PAYMENT_MODE}
          value={row.row.original.paymentMode}
          onValueChange={value => handleInputChange(row.row.index, "paymentMode", value)} />
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
      cell: (row) => <InputCustom size={"xs"} key={`${row.row.original.id}-unitPrice`} // Crucial for maintaining focus
        value={row.row.original.unitPrice}
        onChange={e => {
          handleInputChange(row.row.index, "unitPrice", e.target.value);
        }} onBlur={e => {
          handleInputChange(row.row.index, "unitPrice", e.target.value, true);
        }} />
    },
    {
      accessorKey: "quantity",
      header: 'Qty',
      cell: (row) => <InputCustom size={"xs"} key={`${row.row.original.id}-quantity`} // Crucial for maintaining focus
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
          size={"xs"} items={SelectList.CURRENCY}
          value={row.row.original.currency}
          onValueChange={value => handleInputChange(row.row.index, "currency", value)} />
      }
    },
    {
      accessorKey: "isPaid",
      header: 'Is Paid',
      cell: (row) => <Checkbox key={`${row.row.original.id}-isPaid`}
        checked={Boolean(row.row.original.isPaid)}
        onCheckedChange={(checked) => {
          handleInputChange(row.row.index, "isPaid", checked.valueOf());

        }} />
    },
    {
      accessorKey: "paidOnUTC",
      header: 'Paid Date',
      cell: (row) => <DatePicker key={`${row.row.original.id}-paidOnUTC`}
        selected={row.row.original.paidOnUTC}
        onChange={(date: Date | null) => {
          handleInputChange(row.row.index, "paidOnUTC", date);
        }}
        dateFormat="yyyy-MM-dd"
        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
        placeholderText="yyyy-mm-dd"
        isClearable={true}
        showIcon
      />
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: (row) => {
        return <div>
          {getActionButton(row.row.original.id, reservationId, row.row.index)}
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
    if (!open) return;
    setBills([]);
    const fetchBills = async () => {
      const response = await billsGet(reservationId);
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
  }, [reservationId, open]);


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