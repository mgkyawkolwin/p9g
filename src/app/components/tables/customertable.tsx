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
import CustomerViewDialog from "../dialogs/customerviewdialog";
import CustomerHistoryDialog from "../dialogs/customerhistorydialog";
import CustomerFilesDialog from "../dialogs/customerfilesdialog";
import CustomerFeedbacksDialog from "../dialogs/customerfeedbacksdialog";
import { CopyIcon, Eye, FolderOpen, History as HistoryIcon, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import { toast } from "sonner";
import { customerUpdate } from "@/app/(private)/[location]/console/customers/[id]/edit/actions";
import { useParams } from "next/navigation";

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
  const params = useParams();
  const location = params.location as string;

  const openCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void, setEditCustomer: (customer: Customer) => void } | undefined>(undefined);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = React.useState<Customer | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [historyCustomer, setHistoryCustomer] = React.useState<Customer | null>(null);
  const [filesCustomer, setFilesCustomer] = React.useState<Customer | null>(null);
  const [feedbacksCustomer, setFeedbacksCustomer] = React.useState<Customer | null>(null);
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
      size: 70,
      cell: ({ row }) => {
        return <div>
          {String(row.getValue("id")).substring(0, 8)} <CopyIcon className="inline w-[20px] cursor-pointer" onClick={e => navigator.clipboard.writeText(row.getValue("id"))} />
        </div>
      }
    },
    {
      accessorKey: "combinedName",
      header: "Name",
      cell: ({ row }) => {
        return <div className="">
          {row.original.name ?? ''} / {row.original.englishName ?? ''}
        </div>
      }
    },
    {
      accessorKey: "gender",
      header: "Gender",
      size: 50,
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
      accessorKey: "isBlackListed",
      header: "Blacklist",
      size: 80,
      cell: ({ row }) => {
        const val = row.getValue('isBlackListed');
        return <div>{val ? <div style={{color: "red"}}>Blacklist</div> : ''}</div>
      }
    },
    {
      accessorKey: "remarks",
      header: "Remark",
      cell: ({ row }) => {
        return <div className="flex max-w-[150px] whitespace-normal" >{String(row.getValue('remarks'))}</div>
      }
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex flex-col gap-1" style={{ minWidth: "max-content" }}>
          <div className="flex gap-1">
            <ButtonCustom variant={"black"} size={"sm"} type="button" onClick={(e) => {
              openCallbackFunc.current?.setEditCustomer(row.original);
              openCallbackFunc.current?.openDialog(true);
            }}>
              <Pencil aria-hidden="true" className="mr-1 size-4" />
              Edit
            </ButtonCustom>
            <ButtonCustom variant={"black"} size={"sm"} type="button" onClick={() => {
              setViewCustomer(row.original);
              setIsViewOpen(true);
            }}>
              <Eye aria-hidden="true" className="mr-1 size-4" />
              View
            </ButtonCustom>
          </div>
          <div className="flex gap-1">
            <ButtonCustom variant={"black"} size={"sm"} type="button" onClick={() => setHistoryCustomer(row.original)}>
              <HistoryIcon aria-hidden="true" className="mr-1 size-4" />
              History
            </ButtonCustom>
            <ButtonCustom variant={"black"} size={"sm"} type="button" onClick={() => setFilesCustomer(row.original)}>
              <FolderOpen aria-hidden="true" className="mr-1 size-4" />
              Files
            </ButtonCustom>
          </div>
          <div className="flex gap-1">
            <ButtonCustom variant={"black"} size={"sm"} type="button" onClick={() => setFeedbacksCustomer(row.original)}>
              <MessageSquare aria-hidden="true" className="mr-1 size-4" />
              Feedbacks
            </ButtonCustom>
            {!row.original.isDeleted && <ButtonCustom variant={"red"} size={"sm"} type="button" onClick={() => {
              setSelectedCustomer(row.original);
              setOpenDeleteDialog(true);
            }}>
              <Trash2 aria-hidden="true" className="mr-1 size-4" />
              Delete
            </ButtonCustom>}
          </div>
        </div>
      }
    },
  ];

  const handleSave = (customer: Customer) => {
    window.location.reload();
  };


  return (
    <>
      <DataTable columns={columns} formState={clientState} formAction={formAction} formRef={formRef} />
      <section className="flex">
        <CustomerEditForm openCallback={(func) => openCallbackFunc.current = func} onSaved={handleSave} />
      </section>
      <CustomerViewDialog customer={viewCustomer} open={isViewOpen} onOpenChange={setIsViewOpen} location={location} />
      <CustomerHistoryDialog customer={historyCustomer} open={historyCustomer !== null} onOpenChange={(open) => { if (!open) setHistoryCustomer(null); }} location={location} />
      <CustomerFeedbacksDialog customer={feedbacksCustomer} open={feedbacksCustomer !== null} onOpenChange={(open) => { if (!open) setFeedbacksCustomer(null); }} location={location} />
      <CustomerFilesDialog customer={filesCustomer} open={filesCustomer !== null} onOpenChange={(open) => { if (!open) setFilesCustomer(null); }} location={location} />
      <section className="flex">
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>Confirm!</DialogTitle>
              <DialogDescription>Are you sure you want to delete the customer?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"red"} type="button" onClick={async () => {
                setOpenDeleteDialog(false);
                if (selectedCustomer) {
                  const updated = { ...selectedCustomer, isDeleted: true } as Customer;
                  const response = await customerUpdate(updated, location);
                  if (response.message) toast(response.message);
                  if (!response.error) {
                    window.location.reload();
                  }
                  setSelectedCustomer(null);
                }
              }}>Yes</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => { setSelectedCustomer(null); setOpenDeleteDialog(false); }}>No</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </>
  )
}