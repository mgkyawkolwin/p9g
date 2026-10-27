"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/lib/components/web/react/uicustom/datatable";
import { FormState } from "@/core/types";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";
import { CopyIcon } from "lucide-react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import PrepaidPackageEditForm from "@/app/components/forms/prepaidpackageeditform";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import { prepaidPackageCustomerSummaryGet, prepaidPackageUsageGetListAction } from "@/app/(private)/[location]/console/packages/actions";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import PrepaidPackagePaymentDialog from "@/app/components/dialogs/prepaidpackagepaymentdialog";


interface PrepaidUsage {
  reservationId: string;
  customerEnglishName: string;
  customerName: string | null;
  startDate: Date | string;
  endDate: Date | string;
  days: number;
}

interface PrepaidPackageCustomerSummary {
  customerId: string;
  name: string;
  englishName: string;
  totalDaysUsed: number;
}

interface DataTableProps {
  formState: FormState;
  formAction: (formData: FormData) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}


export default function PrepaidPackageTable({
  formState,
  formAction,
  formRef,
}: DataTableProps) {
  const params = useParams();
  const location = params.location as string;
  const editDialogRef = React.useRef<{
    openDialog: (open: boolean) => void;
    setEditPrepaidPackage: (prepaidPackage: PrepaidPackage) => void;
  } | undefined>(undefined);
  const paymentDialogRef = React.useRef<{
    openDialog: (open: boolean, prepaidPackageId?: string) => void;
  } | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [historyPackage, setHistoryPackage] = React.useState<PrepaidPackage | null>(null);
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [customerSummaries, setCustomerSummaries] = React.useState<PrepaidPackageCustomerSummary[]>([]);
  const historyFormRef = React.useRef<HTMLFormElement>(null);
  const [historyState, historyFormAction] = React.useActionState(prepaidPackageUsageGetListAction, {
    error: false,
    message: ""
  });

  React.useEffect(() => {
    if (historyState.message) toast(historyState.message);
  }, [historyState]);

  const openCustomerSummary = async (prepaidPackageId: string) => {
    setSummaryOpen(true);
    setSummaryLoading(true);
    setCustomerSummaries([]);
    try {
      const result = await prepaidPackageCustomerSummaryGet(prepaidPackageId, location);
      if (result.error) {
        toast(result.message);
        setSummaryOpen(false);
        return;
      }
      setCustomerSummaries((result.data ?? []) as PrepaidPackageCustomerSummary[]);
    } finally {
      setSummaryLoading(false);
    }
  };

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const columns: ColumnDef<PrepaidPackage>[] = [
    {
      accessorKey: "id",
      header: "Id",
      cell: ({ row }) => (
        <div>
          {String(row.getValue("id")).substring(0, 8)} <CopyIcon className="inline w-[20px] cursor-pointer" onClick={() => navigator.clipboard.writeText(String(row.getValue("id")))} />
        </div>
      )
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.customerEnglishName}</span>
          <span>{row.original.customerName}</span>
        </div>
      )
    },
    {
      accessorKey: "prepaidPackageTypeText",
      header: "Package Type",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "effectiveStartDate",
      header: "Effective Start",
      cell: ({ row }) => (
        <span>{row.getValue('effectiveStartDate') ? new Date(String(row.getValue('effectiveStartDate'))).toLocaleDateString('sv-SE') : ''}</span>
      )
    },
    {
      accessorKey: "effectiveEndDate",
      header: "Effective End",
      cell: ({ row }) => {
        const effectiveEndDate = row.getValue('effectiveEndDate');
        if (!effectiveEndDate) return <span />;

        const expiryDate = new Date(String(effectiveEndDate));
        const today = new Date();
        expiryDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return (
          <span className={expiryDate > today ? "text-red-600" : ""}>
            {expiryDate.toLocaleDateString('sv-SE')}
          </span>
        );
      }
    },
    {
      accessorKey: "noOfDays",
      header: "Days",
      cell: ({ row }) => (
        <span>{row.original.daysUsed}/{row.getValue('noOfDays')}</span>
      )
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span>{formatter.format(Number(row.getValue('price') ?? 0))}</span>
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      cell: ({ row }) => <span>{formatter.format(Number(row.getValue('paidAmount') ?? 0))}</span>
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => (
        <span className={row.original.paymentStatus === 'Unpaid' ? "text-red-600" : ""}>
          {row.original.paymentStatus}
        </span>
      )
    },
    {
      accessorKey: "packageStatus",
      header: "Package Status",
      cell: ({ row }) => {
        const className = row.original.packageStatus === 'In Use'
          ? "text-green-600"
          : row.original.packageStatus === 'Finished'
            ? "text-red-600"
            : "";

        return <span className={className}>{row.original.packageStatus}</span>;
      }
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => <div className="flex max-w-[220px] whitespace-normal">{String(row.getValue('remark') ?? '')}</div>
    },
    {
      accessorKey: "action",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <ButtonCustom
            variant="black"
            size="sm"
            type="button"
            onClick={() => openCustomerSummary(row.original.id)}
          >
            Summary
          </ButtonCustom>
          <ButtonCustom
            variant="black"
            size="sm"
            type="button"
            onClick={() => {
              setHistoryPackage(row.original);
              setHistoryOpen(true);
            }}
          >
            History
          </ButtonCustom>
          <ButtonCustom
            variant="black"
            size="sm"
            type="button"
            onClick={() => paymentDialogRef.current?.openDialog(true, row.original.id)}
          >
            Payment
          </ButtonCustom>
          <ButtonCustom
            variant="black"
            size="sm"
            type="button"
            onClick={() => {
              editDialogRef.current?.setEditPrepaidPackage(row.original);
              editDialogRef.current?.openDialog(true);
            }}
          >
            Edit
          </ButtonCustom>
        </div>
      )
    }
  ];

  const historyColumns: ColumnDef<PrepaidUsage>[] = [
    {
      accessorKey: "reservationId",
      header: "Reservation ID",
    },
    {
      accessorKey: "customerEnglishName",
      header: "Customer",
      cell: ({ row }) => <span>{row.original.customerEnglishName} {row.original.customerName ?? ''}</span>
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => <span>{new Date(row.original.startDate).toLocaleDateString('sv-SE')}</span>
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => <span>{new Date(row.original.endDate).toLocaleDateString('sv-SE')}</span>
    },
    {
      accessorKey: "days",
      header: "Days",
    },
  ];

  return (
    <>
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      <PrepaidPackageEditForm
        openCallback={(callbacks) => { editDialogRef.current = callbacks; }}
        onSaved={() => formRef.current?.requestSubmit()}
      />
      <PrepaidPackagePaymentDialog
        openCallback={(callbacks) => { paymentDialogRef.current = callbacks; }}
        onSaved={() => formRef.current?.requestSubmit()}
      />
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent
          style={{ width: '80vw', height: '80vh', maxWidth: 'none' }}
          className="flex flex-col items-stretch justify-start overflow-hidden"
        >
          <DialogHeader>
            <DialogTitle>Customer Summary</DialogTitle>
            <DialogDescription>Total package days used by each customer.</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            {summaryLoading ? (
              <div className="py-8 text-center">Loading customer summary...</div>
            ) : customerSummaries.length > 0 ? (
              <div className="min-h-0 flex-1 overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b text-left">
                    <th className="px-3 py-2 align-top">Customer ID</th>
                    <th className="px-3 py-2 align-top">Name</th>
                    <th className="px-3 py-2 align-top">English Name</th>
                    <th className="px-3 py-2 text-right align-top">Total Days Used</th>
                  </tr>
                </thead>
                <tbody>
                  {customerSummaries.map(customer => (
                    <tr key={customer.customerId} className="border-b last:border-0">
                      <td className="px-3 py-2 align-top">{customer.customerId}</td>
                      <td className="px-3 py-2 align-top">{customer.name}</td>
                      <td className="px-3 py-2 align-top">{customer.englishName}</td>
                      <td className="px-3 py-2 text-right align-top">{customer.totalDaysUsed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <div className="py-8 text-center">No customers with packages found.</div>
            )}
          </div>
          <div className="mt-auto flex w-full justify-end pt-2">
            <ButtonCustom type="button" variant="black" onClick={() => setSummaryOpen(false)}>Cancel</ButtonCustom>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent
          style={{ width: '80vw', height: '80vh', maxWidth: 'none' }}
          className="flex flex-col items-stretch justify-start overflow-hidden"
        >
          <DialogHeader>
            <DialogTitle>Prepaid Usage History</DialogTitle>
            <DialogDescription>
              {historyPackage ? `${historyPackage.customerEnglishName} ${historyPackage.customerName}` : ''}
            </DialogDescription>
          </DialogHeader>
          <form ref={historyFormRef} action={historyFormAction} className="min-h-0 flex-1 overflow-auto">
            <input type="hidden" name="id" value={historyPackage?.id ?? ''} />
            <input type="hidden" name="location" value={location} />
            <DataTable columns={historyColumns} formState={historyState} formAction={historyFormAction} formRef={historyFormRef} />
          </form>
          <div className="mt-auto flex w-full justify-end pt-2">
            <ButtonCustom type="button" variant="black" onClick={() => setHistoryOpen(false)}>Close</ButtonCustom>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}