"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

import {
  ColumnDef
} from "@tanstack/react-table"

import DataTable from "../../../lib/components/web/react/uicustom/datatable";
import { FormState } from "@/lib/types";
import User from "@/core/models/domain/User";


export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "User ID",
  },
  {
    accessorKey: "userName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: () => {
      return <div>
        <Button>Save</Button>
      </div>
    }
  },
];

interface DataTableProps {
  formState: FormState
  formAction: (formData: FormData) => void
  isPending: boolean
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function UserListTable({
  formState,
  formAction,
  isPending,
  formRef
}: DataTableProps) {

  return (
    <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
  )
}