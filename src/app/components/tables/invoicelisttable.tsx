"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "../../../lib/components/web/react/uicustom/datatable";
import { FormState } from "@/core/types";
import Invoice from "@/core/models/domain/Invoice";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import InvoiceEditDialog from "../dialogs/invoiceeditdialog";
import { Loader } from "@/lib/components/web/react/uicustom/loader";


interface DataTableProps {
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function InvoiceListTable({
  formState,
  formAction,
  formRef
}: DataTableProps) {

  const editDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);
  const [invoiceId, setInvoiceId] = React.useState('');

  const getInvoiceStatusColorClass = (status: string): string => {
    switch (status) {
      case 'DRAFT':
        return 'text-[#888888] dark:text-[#aaaaaa]';
      case 'SENT':
        return 'text-[#0066ff] dark:text-[#4488ff]';
      case 'PAID':
        return 'text-[#00aa00] dark:text-[#00ff00]';
      case 'OVERDUE':
        return 'text-[#ff6600] dark:text-[#ff9900]';
      case 'CANCELLED':
        return 'text-[#ff0000] dark:text-[#ff6666]';
      default:
        return 'text-[#000000] dark:text-[#ffffff]';
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceInfo",
      header: "Invoice Info",
      accessorFn: (row) => {
        return <span>
          <div className="whitespace-nowrap font-bold">{row.invoiceNumber}</div>
          <span className={`font-bold ${getInvoiceStatusColorClass(row.status)}`}>{row.status}</span><br />
          <span className="text-sm">{row.invoiceDate ? new Date(row.invoiceDate).toLocaleDateString('sv-SE') : ''}</span>
        </span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: (row) => {
        return <div className="flex max-w-[200px] whitespace-normal">{String(row.getValue())}</div>
      }
    },
    {
      accessorKey: "amountInfo",
      header: "Amount Info",
      accessorFn: (row) => {
        return <span>
          Total KWR: {row.totalAmountKWR || 0}<br />
          Total THB: {row.totalAmountTHB || 0}<br />
          Due KWR: <span className={(row.dueAmountKWR || 0) > 0 ? 'text-[#ff0000] font-bold' : 'text-[#00aa00]'}>{row.dueAmountKWR || 0}</span><br />
          Due THB: <span className={(row.dueAmountTHB || 0) > 0 ? 'text-[#ff0000] font-bold' : 'text-[#00aa00]'}>{row.dueAmountTHB || 0}</span>
        </span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      accessorFn: (row) => {
        const dueDate = row.invoiceDate ? new Date(row.invoiceDate) : null;
        const today = new Date();
        const isOverdue = dueDate && dueDate < today && row.status !== 'PAID';
        
        return <span className={isOverdue ? 'text-[#ff0000] font-bold' : ''}>
          {dueDate ? dueDate.toLocaleDateString('sv-SE') : ''}
          {isOverdue ? <br /> : ''}
          {isOverdue ? <span className="text-[#ff0000]">OVERDUE</span> : ''}
        </span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: (row) => {
        return <div className="flex max-w-[150px] whitespace-normal">{String(row.row.original.notIncluded || '')}</div>
      }
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex flex-col gap-1">
          <ButtonCustom 
            type="button" 
            variant={"black"} 
            size={"sm"} 
            onClick={() => {
              setInvoiceId(row.original.id);
              editDialogCallbackFunc.current?.openDialog(true);
            }}
          >
            Edit
          </ButtonCustom>
        </div>
      }
    },
  ];

  return (
    <>
      <Loader isLoading={formState.error === false && !formState.data} />
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      <InvoiceEditDialog invoiceId={invoiceId} callbackFunctions={(func) => { editDialogCallbackFunc.current = func }} formRef={formRef} />
    </>
  )
}
