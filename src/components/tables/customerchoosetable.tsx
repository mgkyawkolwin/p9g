"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import {
  ColumnDef
} from "@tanstack/react-table";
import SimpleDataTable from "./simpledatatable";
import { ButtonCustom } from "../uicustom/buttoncustom";
import Customer from "@/core/domain/models/Customer";


interface DataTableProps {
  data: Customer[];
  selectedCustomers: Customer[];
  setSelectedCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CustomerChooseTable({
  data,
  selectedCustomers,
  setSelectedCustomers,
  setOpen
}: DataTableProps) {

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: "Guest ID",
      cell: row => row.getValue()?.toString().substring(0,8)
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
      accessorKey: "englishName",
      header: 'English Name',
    },
    {
      accessorKey: "dob",
      header: 'DOB',
      cell: row => {
        return row.getValue() ? new Date(String(row.getValue())).toISODateString() : ''
      }
    },
    {
      accessorKey: "nationalId",
      header: 'National ID',
    },
    {
      accessorKey: "passport",
      header: 'Passport',
    },
    {
      accessorKey: "phone",
      header: 'Phone',
    },
    {
      accessorKey: "email",
      header: 'Email',
    },
    {
      accessorKey: "country",
      header: 'Country',
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div>
          <ButtonCustom variant={"green"} size={"sm"}
          onClick={() => {
            setSelectedCustomers([...selectedCustomers, row.original]);
            setOpen(false);
          }}>Choose</ButtonCustom>
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