"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import {
  ColumnDef
} from "@tanstack/react-table"

import DataTable from "./datatable"
import { ReservationEntity } from "@/data/orm/drizzle/mysql/schema"
import c from "@/lib/core/logger/ConsoleLogger"
import { FormState } from "@/lib/types"
import { useRouter } from "next/router"
import Reservation from "@/domain/models/Reservation"
import Customer from "@/domain/models/Customer"




interface DataTableProps<TData, TValue> {
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement|null>;
}

export default function ReservationListTable<TData, TValue>({
  formState,
  formAction,
  formRef
}: DataTableProps<TData, TValue>) {
  c.i('Client > ReservationListTable');
  c.d(JSON.stringify(formState));

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return <div>
          {String(row.getValue("id")).substring(0,8)}
        </div>
      }
    },
    {
      accessorKey: "reservationType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "reservationStatus",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Phone
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button className="p-0 m-0 w-fit"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Emailx
            <ArrowUpDown className="ml-1 h-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "remark",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Remark
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div>
          <Button>Edit</Button>
        </div>
      }
    },
  ];

  return (
    <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
  )
}