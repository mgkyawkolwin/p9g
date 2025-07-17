"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "./datatable";
import c from "@/lib/core/logger/ConsoleLogger"
import { FormState } from "@/lib/types";
import { InputCustom } from "../uicustom/inputcustom"
import { ButtonCustom } from "../uicustom/buttoncustom";
import Customer from "@/domain/models/Customer"
import CustomerEditForm from "../forms/customereditform";


interface DataTableProps{
  formState: FormState;
  formAction: (formData: FormData) => void;
  formRef: React.RefObject<HTMLFormElement|null>;
}

export default function CustomerTable({
  formState,
  formAction,
  formRef,
}: DataTableProps) {
  c.i('Client CustomerTable');
  c.d(JSON.stringify(formState));

  const openCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void , setEditCustomer: (customer: Customer) => void} | undefined>(undefined);

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
        {String(row.getValue("id")).substring(0,8)}
      </div>
    }
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div>
        {/* <InputCustom variant={'table'} size={'sm'} className="w-50" defaultValue={row.getValue('name')} 
          ref={(el : any) => (nameRefs.current[String(row.getValue('id'))] = el)}
        /> */}
        {row.getValue('name')}
      </div>
    }
  },
  {
    accessorKey: "dob",
    header: "DOB",
    cell: ({ row }) => {
      return <div>
        {/* <InputCustom readOnly variant={'table'} size={'sm'} className="w-50" defaultValue={row.getValue('dob')} 
          ref={(el : any) => (dobRefs.current[String(row.getValue('id'))] = el)}
        /> */}

        {row.getValue('dob') ? new Date(row.getValue('dob')).toLocaleDateString('sv-SE') : ''}
      </div>
    }
  },
  {
    accessorKey: "nationalId",
    header: "National ID",
    cell: ({ row }) => {
      return <div>
        {/* <InputCustom readOnly variant={'table'} size={'xs'} className="w-50" defaultValue={row.getValue('nationalId')} 
          ref={(el : any) => (nationalIdRefs.current[String(row.getValue('id'))] = el)}
        /> */}

        {row.getValue('nationalId')}
      </div>
    }
  },
  {
    accessorKey: "passport",
    header: "Passport",
    cell: ({ row }) => {
      return <div>
        {/* <InputCustom readOnly variant={'table'} size={'xs'} className="w-50" defaultValue={row.getValue('passport')} 
          ref={(el : any) => (passportRefs.current[String(row.getValue('id'))] = el)}
        /> */}
      {row.getValue('passport')}
      </div>
    }
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      return <div>
        {/* <InputCustom readOnly variant={'table'} size={'xs'} className="w-50" defaultValue={row.getValue('phone')} 
          ref={(el : any) => (phoneRefs.current[String(row.getValue('id'))] = el)}
        /> */}
      {row.getValue('phone')}
      </div>
    }
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return <div>
        {/* <InputCustom readOnly variant={'table'} size={'xs'} className="w-50" defaultValue={row.getValue('email')} 
          ref={(el : any) => (emailRefs.current[String(row.getValue('id'))] = el)}
        /> */}
        {row.getValue('email')}
      </div>
    }
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      return <div>
        {/* <InputCustom readOnly variant={'table'} size={'xs'} className="w-50" defaultValue={row.getValue('address')} 
          ref={(el : any) => (addressRefs.current[String(row.getValue('id'))] = el)}
        /> */}
      {row.getValue('address')}
      </div>
    }
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => {
      return <div>
        {/* <InputCustom readOnly variant={'table'} size={'xs'} className="w-50" defaultValue={row.getValue('country')} 
          ref={(el : any) => (countryRefs.current[String(row.getValue('id'))] = el)}
        /> */}
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
          c.i('[Client] Save action is clicked.');
          // if(formRef){
          //   const formData = new FormData(formRef.current ?? undefined);

          //   let input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "id";
          //   input.value = row.getValue('id');
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "name";
          //   input.value = nameRefs.current[String(row.getValue('id'))].value;
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "dob";
          //   input.value = dobRefs.current[String(row.getValue('id'))].value;
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "nationalId";
          //   input.value = nationalIdRefs.current[String(row.getValue('id'))].value;
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "passport";
          //   input.value = passportRefs.current[String(row.getValue('id'))].value;
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "phone";
          //   input.value = phoneRefs.current[String(row.getValue('id'))].value;
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "email";
          //   input.value = emailRefs.current[String(row.getValue('id'))].value;
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "address";
          //   input.value = addressRefs.current[String(row.getValue('id'))].value;
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "country";
          //   input.value = countryRefs.current[String(row.getValue('id'))].value;
          //   formRef?.current?.appendChild(input);

          //   input = document.createElement('input');
          //   input.type = 'hidden';
          //   input.name = "action";
          //   input.value = "UPDATE";
          //   formRef?.current?.appendChild(input);

          //   //submit form
          //   formRef?.current?.requestSubmit();
          // }
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