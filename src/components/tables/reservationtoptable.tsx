"use client"

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

import {
  ColumnDef
} from "@tanstack/react-table";
import c from "@/lib/core/logger/ConsoleLogger";
import SimpleDataTable from "./simpledatatable";
import Reservation from "@/domain/models/Reservation";
import Customer from "@/domain/models/Customer";


export const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: "id",
    header: "ID",
    accessorFn: (row) => {
      return row.id.substring(0,8);
    }
  },
  {
    accessorKey: "reservationStatusText",
    header: 'Status',
  },
  {
    accessorKey: "reservationTypeText",
    header: 'Type',
  },
  {
    accessorKey: "remark",
    header: 'Remark',
    cell: (row) => {
      return <div className="flex max-w-[150px] whitespace-normal" >{String(row.getValue())}</div>
    }
  },
  {
    accessorKey: "customers",
    header: 'Customer Name',
    cell: ({row}) => {
      return (
        <div className="flex flex-col">
        {
          row.original.customers?.map(customer => (<span key={customer.id}>{customer.englishName} {customer.name}</span>))
        }
        </div>
    )}
  },
  {
    id: "checkInOutDateUTC",
    accessorFn: (row) => {
      return <span>{new Date(String(row.checkInDateUTC)).toLocaleDateString('sv-SE')} <br/> {new Date(String(row.checkOutDateUTC)).toLocaleDateString('sv-SE')}</span>;
    },
    header: 'Check-In / Check-Out',
    cell: (row) => {
      return row.getValue();
    }
  },
];

interface DataTableProps {
  data: Reservation[]
}

export default function ReservationTopTable({
  data
}: DataTableProps) {
  c.i('Client > ReservationTopTable');

  return (
    <SimpleDataTable columns={columns} data={data ?? []} />
  )
}