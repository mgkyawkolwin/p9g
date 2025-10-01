"use client"

import * as React from "react"
import { Button } from "@/lib/components/web/react/ui/button"
import { ArrowUpDown, CopyIcon } from "lucide-react"

import {
  ColumnDef
} from "@tanstack/react-table";
import SimpleDataTable from "../../../lib/components/web/react/uicustom/simpledatatable";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import Customer from "@/core/models/domain/Customer";
import CustomerEditForm from "../forms/customereditform";


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
      cell: ({ row }) => {
        return (
          <div>
            {String(row.getValue("id")).substring(0, 8)} <CopyIcon className="inline w-[20px] cursor-pointer" onClick={e => navigator.clipboard.writeText(row.id)} />
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
      accessorKey: "englishName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            English Name
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
        return row.getValue() ? new Date(String(row.getValue())).toISOFormatDateString() : ''
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
        return <div className="flex gap-2">
          <ButtonCustom variant={"black"} size={"sm"} type="button" onClick={(e) => {
            openCallbackFunc.current?.setEditCustomer(row.original);
            openCallbackFunc.current?.openDialog(true);
          }}>Edit</ButtonCustom>
          <ButtonCustom variant={"red"} size={"sm"} onClick={() => {
            setData(data.filter((customer, index, array) => index !== row.index));
          }}>Remove</ButtonCustom>
        </div>
      }
    },
  ];

  const openCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void, setEditCustomer: (customer: Customer) => void } | undefined>(undefined);

  const handleCustomerSaved = (customer: Customer) => {
      setData(prev => [...prev.filter(p => p.id !== customer.id), customer]);
    };

  return (
    <div className="flex w-full">
      <SimpleDataTable columns={columns} data={data ?? []} />
      <CustomerEditForm openCallback={(func) => openCallbackFunc.current = func} onSaved={handleCustomerSaved} />
    </div>
  )
}