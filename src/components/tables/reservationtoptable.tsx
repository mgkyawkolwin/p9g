"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import SimpleDataTable from "./simpledatatable";
import Reservation from "@/domain/models/Reservation";


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
    id: "checkInOutDate",
    accessorFn: (row) => {
      return <span>{new Date(String(row.checkInDate)).toISODateString()} <br/> {new Date(String(row.checkOutDate)).toISODateString()}</span>;
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

  return (
    <SimpleDataTable columns={columns} data={data ?? []} />
  )
}