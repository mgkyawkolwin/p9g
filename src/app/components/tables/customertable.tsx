"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "../../../lib/components/web/react/uicustom/datatable";
import { FormState } from "@/core/types";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import Customer from "@/core/models/domain/Customer"
import CustomerEditForm from "../forms/customereditform";


interface DataTableProps {
  formState: FormState;
  formAction: (formData: FormData) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function CustomerTable({
  formState,
  formAction,
  formRef,
}: DataTableProps) {

  const openCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void, setEditCustomer: (customer: Customer) => void } | undefined>(undefined);

  const [clientState, setClientState] = React.useState(formState);
  const nameRefs = React.useRef<Record<string, HTMLInputElement>>({});
  const dobRefs = React.useRef<Record<string, HTMLInputElement>>({});
  const nationalIdRefs = React.useRef<Record<string, HTMLInputElement>>({});
  const passportRefs = React.useRef<Record<string, HTMLInputElement>>({});
  const phoneRefs = React.useRef<Record<string, HTMLInputElement>>({});
  const emailRefs = React.useRef<Record<string, HTMLInputElement>>({});
  const addressRefs = React.useRef<Record<string, HTMLInputElement>>({});
  const countryRefs = React.useRef<Record<string, HTMLInputElement>>({});

  React.useEffect(() => {
    setClientState(formState);
  }, [formState]);

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: "Id",
      cell: ({ row }) => {
        return <div>
          {String(row.getValue("id")).substring(0, 8)}
        </div>
      }
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <div>
          {row.getValue('name')}
        </div>
      }
    },
    {
      accessorKey: "englishName",
      header: "English Name",
      cell: ({ row }) => {
        return <div>
          {row.getValue('englishName')}
        </div>
      }
    },
    {
      accessorKey: "gender",
      header: "Gender"
    },
    {
      accessorKey: "dob",
      header: "DOB",
      cell: ({ row }) => {
        return <div>
          {row.getValue('dob') ? new Date(row.getValue('dob')).toLocaleDateString('sv-SE') : ''}
        </div>
      }
    },
    {
      accessorKey: "nationalId",
      header: "National ID",
      cell: ({ row }) => {
        return <div>
          {row.getValue('nationalId')}
        </div>
      }
    },
    {
      accessorKey: "passport",
      header: "Passport",
      cell: ({ row }) => {
        return <div>
          {row.getValue('passport')}
        </div>
      }
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return <div>
          {row.getValue('phone')}
        </div>
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <div>
          {row.getValue('email')}
        </div>
      }
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        return <div>
          {row.getValue('address')}
        </div>
      }
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => {
        return <div>
          {row.getValue('country')}
        </div>
      }
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div>
          <ButtonCustom variant={"black"} size={"sm"} type="button" onClick={(e) => {
            openCallbackFunc.current?.setEditCustomer(row.original);
            openCallbackFunc.current?.openDialog(true);
          }}>Edit</ButtonCustom>
        </div>
      }
    },
  ];

  const handleSave = (customer: Customer) => {
    window.location.reload();
  };


  return (
    <div>
      <DataTable columns={columns} formState={clientState} formAction={formAction} formRef={formRef} />
      <section className="flex">
        <CustomerEditForm openCallback={(func) => openCallbackFunc.current = func} onSaved={handleSave} />
      </section>
    </div>
  )
}