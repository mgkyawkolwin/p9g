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
import SimpleDataTable from "./simpledatatable"
import Reservation from "@/domain/models/Reservation"
import Customer from "@/domain/models/Customer"


export const columns: ColumnDef<Reservation & Customer[], any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    accessorFn: (row) => {
      return row.id.substring(0,8);
    }
  },
  {
    accessorKey: "reservationStatusText",
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
    accessorKey: "reservationTypeText",
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
    accessorKey: "customers",
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
    cell: ({row}) => {
      return (
        <div className="flex flex-col">
        {
          row.original.customers?.map(customer => (<span key={customer.id}>{customer.name}</span>))
        }
        </div>
    )}
  },
  {
    id: "checkInOutDateUTC",
    accessorFn: (row) => {
      return <span>{new Date(String(row.checkInDateUTC)).toLocaleDateString('sv-SE')} <br/> {new Date(String(row.checkOutDateUTC)).toLocaleDateString('sv-SE')}</span>;
    },
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
    cell: (row) => {
      return row.getValue();
    }
  },
];

interface DataTableProps<TData, TValue> {
  data: ReservationEntity[]
}

export default function ReservationTopTable<TData, TValue>({
  data
}: DataTableProps<TData, TValue>) {
  c.i('Client > ReservationTopTable');

  return (
    <SimpleDataTable columns={columns} data={data ?? []} />
  )
}