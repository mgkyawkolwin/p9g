"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import { ButtonCustom } from "../uicustom/buttoncustom"
import BillDataTable from "../uicustom/billdatatable"
import Bill from "@/core/domain/models/Bill"
import { InputCustom } from "../uicustom/inputcustom";
import { SelectCustom } from "../uicustom/selectcustom"
import { SelectList } from "@/core/lib/constants"




interface DataTableProps {
  data: Bill[];
}

export default function BillTable({
  data
}: DataTableProps) {

  const columns: ColumnDef<Bill>[] = [
    {
      accessorKey: "index",
      header: "#",
      accessorFn: (row, index) => {
        return index+1;
      },
      cell: row => (row.getValue())
    },
    {
      accessorKey: "itemName",
      header: 'Name',
      cell: row => {
        return <InputCustom name={`itemName[${row.row.index}]`} size={"xxl"} defaultValue={String(row.getValue())} />
      }
    },
    {
      accessorKey: "unitPrice",
      header: 'Unit Price',
      cell: row => {
        return <InputCustom name={`unitPrice[${row.row.index}]`} size={"sm"} defaultValue={String(row.getValue())} />
      }
    },
    {
      accessorKey: "quantity",
      header: 'Quantity',
      cell: row => {
        return <InputCustom name={`quantity[${row.row.index}]`} size={"xs"} defaultValue={String(row.getValue())} />
      }
    },
    {
      accessorKey: "amount",
      header: 'Amount',
    },
    {
      accessorKey: "currency",
      header: 'Currency',
      cell: row => {
        return <SelectCustom name={`currency[${row.row.index}]`} size={"sm"} items={SelectList.CURRENCY} defaultValue="THB" />
      }
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: () => {
        return <div>
          <ButtonCustom variant={"black"} size={"sm"}
          onClick={() => {
          }}>Remove</ButtonCustom>
        </div>
      }
    },
  ];

  return (
    <div className="flex w-full">
      <BillDataTable columns={columns} data={data ?? []} />
    </div>
  )
}