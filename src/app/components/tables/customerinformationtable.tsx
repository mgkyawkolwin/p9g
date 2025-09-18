"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import {
  ColumnDef
} from "@tanstack/react-table";
import SimpleDataTable from "../../../lib/components/web/react/uicustom/simpledatatable";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import Customer from "@/core/models/domain/Customer";


interface DataTableProps {
  data: Customer[];
  setData: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export default function CustomerInformationTable({
  data,
  setData
}: DataTableProps) {

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: "Guest ID",
      cell: ({row}) => {
        return (
          <div>
            {row.getValue('id')}
          </div>
        );
      }
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "dob",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            DOB
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: row => {
        return row.getValue() ? new Date(String(row.getValue())).toISODateString() : ''
      }
    },
    {
      accessorKey: "nationalId",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            National ID
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
      accessorKey: "country",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Country
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
          <ButtonCustom variant={"red"} size={"sm"} onClick={() => {
            setData(data.filter(customer => customer.id !== row.getValue('id')));
          }}>Remove</ButtonCustom>
        </div>
      }
    },
  ];

  return (
    <div className="flex w-full">
      <SimpleDataTable columns={columns} data={data ?? []} />
    </div>
  )
}