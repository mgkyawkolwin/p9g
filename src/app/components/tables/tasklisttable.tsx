"use client"

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../../lib/components/web/react/uicustom/datatable";
import { FormState } from "@/core/types";
import { TaskClosedStatuses } from "@/core/constants";
import { CopyIcon, Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import TaskEditDialog from "../dialogs/taskeditdialog";

interface TaskRow {
  id: string;
  reservationId: string | null;
  customerId: string | null;
  customerName: string | null;
  customerLocalName: string | null;
  description: string;
  department: string | null;
  status: string;
  remark: string | null;
  targetCompletionDateTime: string | null;
  createdAtUTC: string;
  createdBy: string;
  createdByName: string | null;
  updatedAtUTC: string;
  updatedBy: string;
  updatedByName: string | null;
}

interface Props {
  formState: FormState;
  formAction: (formData: FormData) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}

const formatDateTime = (value: string) => value ? new Date(value).toLocaleString("sv-SE") : "";

const isOverdue = (task: TaskRow) =>
  !!task.targetCompletionDateTime
  && new Date(task.targetCompletionDateTime).getTime() < Date.now()
  && !(TaskClosedStatuses as readonly string[]).includes(task.status);

export default function TaskListTable({ formState, formAction, formRef }: Props) {
  const params = useParams();
  const location = params.location as string;
  const [editTask, setEditTask] = React.useState<TaskRow | null>(null);

  const columns: ColumnDef<TaskRow>[] = [
    { accessorKey: "description", header: "Description", cell: ({ row }) => <div className="max-w-[150px] whitespace-normal">{row.original.description}</div> },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "remark", header: "Remark" },
    { accessorKey: "targetCompletionDateTime", header: "Target Completion", cell: ({ row }) => formatDateTime(row.original.targetCompletionDateTime ?? "") },
    {
      id: "overdue",
      header: "Overdue",
      cell: ({ row }) => isOverdue(row.original) ? <span className="font-semibold" style={{ color: "red" }}>OVERDUE</span> : ""
    },
    {
      accessorKey: "reservationId",
      header: "Reservation Id",
      cell: ({ row }) => {
        const id = row.original.reservationId;
        if (!id) return "";
        return <div>
          {id.substring(0, 8)} <CopyIcon className="inline w-[20px] cursor-pointer" onClick={() => navigator.clipboard.writeText(id)} />
        </div>;
      }
    },
    { accessorKey: "customerName", header: "Customer", cell: ({ row }) => [row.original.customerName, row.original.customerLocalName].filter(Boolean).join(" / ") },
    { accessorKey: "createdAtUTC", header: "Created At", cell: ({ row }) => formatDateTime(row.original.createdAtUTC) },
    { accessorKey: "createdByName", header: "Created By", cell: ({ row }) => row.original.createdByName || row.original.createdBy },
    { accessorKey: "updatedAtUTC", header: "Updated At", cell: ({ row }) => formatDateTime(row.original.updatedAtUTC) },
    { accessorKey: "updatedByName", header: "Updated By", cell: ({ row }) => row.original.updatedByName || row.original.updatedBy },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <ButtonCustom variant="black" size="sm" type="button" onClick={() => setEditTask(row.original)}>
          <Pencil aria-hidden="true" className="mr-1 size-4" />
          Edit
        </ButtonCustom>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      <TaskEditDialog task={editTask} open={editTask !== null} onOpenChange={(open) => { if (!open) setEditTask(null); }}
        onSaved={() => formRef.current?.requestSubmit()} location={location} />
    </>
  );
}
