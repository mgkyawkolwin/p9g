"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { FormState } from "@/core/types";
import Customer from "@/core/models/domain/Customer";
import DataTable from "@/lib/components/web/react/uicustom/datatable";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/lib/components/web/react/ui/dialog";

interface FeedbackRow {
  id: string;
  reservationId: string;
  reservationType: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  location: string;
  feedback: string | null;
}

interface Props {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
}

const formatDate = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("sv-SE");
};

const columns: ColumnDef<FeedbackRow>[] = [
  { accessorKey: "reservationId", header: "Reservation ID" },
  { accessorKey: "reservationType", header: "Reservation Type" },
  { accessorKey: "checkInDate", header: "Check In", cell: ({ row }) => formatDate(row.original.checkInDate) },
  { accessorKey: "checkOutDate", header: "Check Out", cell: ({ row }) => formatDate(row.original.checkOutDate) },
  { accessorKey: "location", header: "Location" },
  { accessorKey: "feedback", header: "Feedback", cell: ({ row }) => <div className="whitespace-pre-wrap">{row.original.feedback}</div> },
];

export default function CustomerFeedbacksDialog({ customer, open, onOpenChange, location }: Props) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, setState] = React.useState<FormState>({ error: false, message: "" });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer?.id) return;
    const fd = new FormData(e.currentTarget);
    const query = new URLSearchParams({
      pageIndex: String(fd.get("pageIndex") ?? 1),
      pageSize: String(fd.get("pageSize") ?? 10),
    });
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(customer.id)}/feedbacks?${query}`, {
        headers: { "X-Resort-Location": location },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Unable to load feedbacks.");
      setState({ error: false, message: "", data: json.data, pager: json.pager });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Unable to load feedbacks.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", minWidth: "90vw", height: "90vh", maxHeight: "90vh" }}
        className="overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Feedbacks - {customer?.englishName || customer?.name}</DialogTitle>
          <DialogDescription className="sr-only">Customer feedbacks</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={onSubmit}>
          <DataTable columns={columns} formState={state} formAction={() => { }} formRef={formRef} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
