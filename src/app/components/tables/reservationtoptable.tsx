"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import SimpleDataTable from "../../../lib/components/web/react/uicustom/simpledatatable";
import Reservation from "@/core/models/domain/Reservation";
import { getReservationStatusColorClass } from "@/lib/utils";


export const columns: ColumnDef<Reservation>[] = [
  {
        accessorKey: "customReservationInfo",
        header: "ID",
        accessorFn: (row) => {
          return <span>
            <a href={`/console/reservations/${row.id}/edit`}>{row.id.substring(0, 8)}</a><br />
            <span className={`font-bold ${getReservationStatusColorClass(row.reservationStatusText)}`}>{row.reservationStatusText}</span><br />
            <span>{row.reservationTypeText}</span>
            {row.prepaidPackageText ? <span className="font-bold text-[#ff00ff] dark:text-[#ff00ff]"><br />{row.prepaidPackageText}</span> : ''}
            {row.promotionPackageText ? <span className="font-bold text-[#dd5500] dark:text-[#ff9911]"><br />{row.promotionPackageText}</span> : ''}
          </span>;
        },
        cell: (row) => row.getValue(),
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