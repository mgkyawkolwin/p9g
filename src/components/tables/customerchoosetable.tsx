"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import {
  ColumnDef
} from "@tanstack/react-table"

import DataTable from "./datatable"
import { Customer } from "@/data/orm/drizzle/mysql/schema"
import c from "@/lib/core/logger/ConsoleLogger"
import { FormState } from "@/lib/types"
import { useRouter } from "next/router"
import SimpleDataTable from "./simpledatatable"
import { ButtonCustom } from "../uicustom/buttoncustom"




interface DataTableProps<TData, TValue> {
  data: Customer[];
  selectedCustomers: any;
  setSelectedCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CustomerChooseTable<TData, TValue>({
  data,
  selectedCustomers,
  setSelectedCustomers,
  setOpen
}: DataTableProps<TData, TValue>) {
  c.i('Client GuestInformationTable');
  c.d(JSON.stringify(data));

  const columns: ColumnDef<Customer, any>[] = [
    {
      accessorKey: "id",
      header: "Guest ID",
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
    },
    {
      accessorKey: "nationlId",
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