"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import {
  ColumnDef
} from "@tanstack/react-table"

import DataTable from "./datatable"
import { Reservation } from "@/data/orm/drizzle/mysql/schema"
import c from "@/lib/core/logger/ConsoleLogger"
import { FormState } from "@/lib/types"
import { useRouter } from "next/router"


export const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: "id",
    header: "Info",
    cell: ({ row }) => {
      return <div>
        ...
      </div>
    }
  },{
    accessorKey: "id",
    header: "Status",
    cell: ({ row }) => {
      return <div>
        ...
      </div>
    }
  },{
    accessorKey: "id",
    header: "Customer",
    cell: ({ row }) => {
      return <div>
        ...
      </div>
    }
  },{
    accessorKey: "id",
    header: "Contact",
    cell: ({ row }) => {
      return <div>
        ...
      </div>
    }
  },{
    accessorKey: "id",
    header: "Room Info",
    cell: ({ row }) => {
      return <div>
        ...
      </div>
    }
  },{
    accessorKey: "id",
    header: "Check-in / Check-out",
    cell: ({ row }) => {
      return <div>
        ...
      </div>
    }
  },{
    accessorKey: "id",
    header: "Arrival / Deperture",
    cell: ({ row }) => {
      return <div>
        ...
      </div>
    }
  },{
    accessorKey: "id",
    header: "Remark",
    cell: ({ row }) => {
      return <div>
        ...
      </div>
    }
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      return <div>
        <Button>Save</Button>
      </div>
    }
  },
];

interface DataTableProps<TData, TValue> {
  formState: FormState
  formAction: (formData: FormData) => void
  isPending: boolean
}

export default function CheckInTable<TData, TValue>({
  formState,
  formAction,
  isPending
}: DataTableProps<TData, TValue>) {
  c.i('Client UserListTable');
  c.d(JSON.stringify(formState));

  return (
    <DataTable columns={columns} data={formState.data ?? []} formState={formState} formAction={formAction} isPending={isPending} />
  )
}