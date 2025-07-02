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
import SimpleDataTable from "./simpledatatable"


export const columns: ColumnDef<Reservation, any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div>
        {String(row.getValue("id")).substring(0,5)}
      </div>
    }
  },
  {
    accessorKey: "reservationTypeId",
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
    accessorKey: "passport",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Passport
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "action",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Check-In / Check-Out
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
];

interface DataTableProps<TData, TValue> {
  data: Reservation[]
}

export default function ReservationTopTable<TData, TValue>({
  data
}: DataTableProps<TData, TValue>) {
  c.i('Client ReservationTopTable');
  c.d(JSON.stringify(data));

  return (
    <SimpleDataTable columns={columns} data={data ?? []} />
  )
}