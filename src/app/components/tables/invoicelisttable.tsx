"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "../../../lib/components/web/react/uicustom/datatable";
import { FormState } from "@/core/types";
import Invoice from "@/core/models/domain/Invoice";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import InvoiceDialog from "../dialogs/invoicedialog";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import { invoiceDelete } from "@/app/(private)/[location]/console/invoices/actions";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useParams } from "next/navigation";


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
  const params = useParams();
  const location = params.location as string;

  const editDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);
  const [invoiceId, setInvoiceId] = React.useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string>('');

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
      accessorKey: "agentName",
      header: "Agent Name",
      cell: (row) => {
        return <div className="flex max-w-[200px] whitespace-normal">{String(row.getValue())}</div>
      }
    },
    {
      accessorKey: "bookingSource",
      header: "Booking Source",
      cell: (row) => <div className="flex max-w-[150px] whitespace-normal">{String(row.getValue() || '')}</div>
    },
    {
      accessorKey: "bookingPerson",
      header: "Booking Person",
      cell: (row) => <div className="flex max-w-[150px] whitespace-normal">{String(row.getValue() || '')}</div>
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: (row) => {
        return <div className="flex max-w-[200px] whitespace-normal">{String(row.getValue())}</div>
      }
    },
    {
      accessorKey: "pax",
      header: "Pax",
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
        
        return <span>
          {dueDate ? dueDate.toLocaleDateString('sv-SE') : ''}
        </span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: (row) => {
        return <div className="flex max-w-[150px] whitespace-normal">{String(row.row.original.note || '')}</div>
      }
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <ButtonCustom 
              type="button" 
              variant={"black"} 
              size={"sm"} 
              onClick={() => {
                setInvoiceId(row.original.id);
                setOpenEditDialog(true);
              }}
            >
              Edit
            </ButtonCustom>
            <ButtonCustom 
              type="button" 
              variant={"red"} 
              size={"sm"} 
              onClick={() => {
                setDeleteId(row.original.id);
                setOpenDeleteDialog(true);
              }}
            >
              <Trash className="w-4 h-4" />
            </ButtonCustom>
          </div>
        </div>
      }
    },
  ];

  return (
    <>
      <Loader isLoading={formState.error === false && !formState.data} />
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      <InvoiceDialog invoiceId={invoiceId} isOpen={openEditDialog} isNew={false} formRef={formRef} onOpenChanged={() => setOpenEditDialog(!openEditDialog)} />
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Confirm!</DialogTitle>
            <DialogDescription>Are you sure you want to delete this invoice?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <ButtonCustom variant={"red"} type="button" onClick={async () => {
              setOpenDeleteDialog(false);
              const response = await invoiceDelete(deleteId, location);
              if (response.message) toast(response.message);
              if (!response.error) formRef.current?.requestSubmit();
              setDeleteId('');
            }}>Yes</ButtonCustom>
            <DialogClose asChild>
              <ButtonCustom variant="black" onClick={() => {
                setDeleteId('');
                setOpenDeleteDialog(false);
              }}>No</ButtonCustom>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
