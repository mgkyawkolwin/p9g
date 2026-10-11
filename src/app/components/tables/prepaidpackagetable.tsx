"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/lib/components/web/react/uicustom/datatable";
import { FormState } from "@/core/types";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";
import { CopyIcon } from "lucide-react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import PrepaidPackageEditForm from "@/app/components/forms/prepaidpackageeditform";


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
  const editDialogRef = React.useRef<{
    openDialog: (open: boolean) => void;
    setEditPrepaidPackage: (prepaidPackage: PrepaidPackage) => void;
  } | undefined>(undefined);

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
      cell: ({ row }) => (
        <span>{row.getValue('effectiveEndDate') ? new Date(String(row.getValue('effectiveEndDate'))).toLocaleDateString('sv-SE') : ''}</span>
      )
    },
    {
      accessorKey: "noOfDays",
      header: "Days",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span>{formatter.format(Number(row.getValue('price') ?? 0))}</span>
    },
    {
      accessorKey: "deposit",
      header: "Deposit",
      cell: ({ row }) => <span>{formatter.format(Number(row.getValue('deposit') ?? 0))}</span>
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => <span>{formatter.format(Number(row.getValue('balance') ?? 0))}</span>
    },
    {
      accessorKey: "depositDateTimeUTC",
      header: "Deposit Date",
      cell: ({ row }) => (
        <span>{row.getValue('depositDateTimeUTC') ? new Date(String(row.getValue('depositDateTimeUTC'))).toLocaleDateString('sv-SE') : ''}</span>
      )
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
      )
    }
  ];

  return (
    <>
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      <PrepaidPackageEditForm
        openCallback={(callbacks) => { editDialogRef.current = callbacks; }}
        onSaved={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}