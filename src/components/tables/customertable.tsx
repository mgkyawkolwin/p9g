"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import {
  ColumnDef
} from "@tanstack/react-table"

import DataTable from "./datatable"
import { Reservation } from "@/data/orm/drizzle/mysql/schema"
import consoleLogger from "@/lib/core/logger/ConsoleLogger"
import { FormState } from "@/lib/types"
import { useRouter } from "next/router"
import { Input } from "../ui/input"
import { InputCustom } from "../uicustom/inputcustom"




interface DataTableProps<TData, TValue> {
  formState: FormState
  formAction: (formData: FormData) => void
    formRef?: React.RefObject<HTMLFormElement>;
  rowFormAction?: (formData: FormData) => void;
  isPending: boolean
}

export default function CustomerTable<TData, TValue>({
  formState,
  formAction,
  formRef,
  rowFormAction,
  isPending
}: DataTableProps<TData, TValue>) {
  consoleLogger.logInfo('Client CustomerTable');
  consoleLogger.logDebug(JSON.stringify(formState));

  const [clientState, setClientState] = React.useState(formState);
  const inputRefs = React.useRef<Record<string, HTMLInputElement>>({});

  React.useEffect(() => {
    setClientState(formState);
  }, [formState]);

  const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: "id",
    header: "Info",
    cell: ({ row }) => {
      return <div>
        {String(row.getValue("id")).substring(0,8)}
        <input type="hidden" name="id" defaultValue={row.getValue('id')} />
      </div>
    }
  },{
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div>
        <InputCustom ref={(el : any) => (inputRefs.current[String(row.getValue('id'))] = el)} variant={'table'} size={'sm'} className="w-50" defaultValue={row.getValue('name')} 
        
        />
      </div>
    }
  },{
    accessorKey: "nationaId",
    header: "National ID"
  },{
    accessorKey: "passport",
    header: "Passport"
  },{
    accessorKey: "phone",
    header: "Phone"
  },{
    accessorKey: "email",
    header: "Email"
  },{
    accessorKey: "address",
    header: "Address"
  },{
    accessorKey: "country",
    header: "Country"
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      return <div>
        <Button type="button" onClick={(e) => {
          consoleLogger.logInfo('[Client] Save action is clicked.');
          //var r = document.getElementById(String(row.index));
          //if(!r) return;
          consoleLogger.logInfo('got row');
          //const inputs = r.querySelectorAll('input[type="text"]');
          if(formRef){
            const formData = new FormData(formRef.current);
            // formData.set("action", "UPDATE");
            // formData.set("id", String(row.getValue("id")));
            // formData.set("name", inputRefs.current[String(row.getValue('id'))].value);
            let input = document.createElement('input');
            input.type = 'hidden';
            input.name = "name";
            input.value = inputRefs.current[String(row.getValue('id'))].value;

            formRef.current.appendChild(input);
            input = document.createElement('input');
            input.name = "action";
            input.value = "UPDATE";
            formRef.current.appendChild(input);

            formRef.current.requestSubmit();
          }

          
          // inputs.forEach(input => {
          //   consoleLogger.logInfo('loop');
          //   const i = input as HTMLInputElement;
          //   formData.set(i.name, i.value);
          // });
          //if(rowFormAction) rowFormAction(formData);
          //formRef?.current?.appendChild(new HTMLHtmlElement());
          // React.startTransition(() => {
          //   consoleLogger.logInfo('start tran');
          //   if(formAction) {
          //     consoleLogger.logInfo('sumitting');
          //     //formAction(formData);
          //     consoleLogger.logInfo('submitted');
          //   }
          //       });
          
        }}>Save</Button>
      </div>
    }
  },
];

  return (
    <DataTable columns={columns} data={clientState.data ?? []} formState={clientState} formAction={formAction} formRef={formRef} isPending={isPending} rowFormAction={rowFormAction} />
  )
}