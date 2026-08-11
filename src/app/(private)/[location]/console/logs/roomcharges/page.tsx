"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { InputWithLabel } from "@/lib/components/web/react/uicustom/inputwithlabel";
import DataTable from "@/lib/components/web/react/uicustom/datatable";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { useParams } from 'next/navigation';
import { roomChargeLogGetList } from "./actions";
import { CopyIcon } from "lucide-react";

export default function RoomChargeLogPage() {
  const params = useParams();
  const location = params.location as string;

  const formRef = React.useRef<HTMLFormElement>(null);
  const [reservationId, setReservationId] = React.useState<string>("");

  const [state, formAction, isPending] = useActionState(roomChargeLogGetList, {
    error: false,
    message: "",
    data: [],
    pager: { pageIndex: 1, pageSize: 10, pages: 0, records: 0 }
  });

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  useEffect(() => {
    if (state.error && state.message) {
      toast(state.message);
    }
  }, [state]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "reservationId",
      header: "Rsv Id",
      cell: (row) => {
        const original = row.row.original;
        return (
          <span>
            <div className="whitespace-nowrap"><a href={`/${location}/console/reservations/${original.reservationId}/edit`}>{original.reservationId.substring(0, 8)}</a>&nbsp;&nbsp;&nbsp;<CopyIcon className="inline w-[20px] cursor-pointer" onClick={e => navigator.clipboard.writeText(original.reservationId)} /></div>
          </span>
        );
      },
    },
    {
      accessorKey: "room",
      header: "Room",
      cell: (row) => {
        const original = row.row.original;
        return (
          <span>
           {original.room || '-'}
          </span>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start",
      cell: (row) => {
        const original = row.row.original;
        return (
          <span>
            {original.startDate ? new Date(original.startDate).toISOFormatDateString() : '-'}
          </span>
        );
      },
    },
    {
      accessorKey: "endDate",
      header: "End",
      cell: (row) => {
        const original = row.row.original;
        return (
          <span>
            {original.endDate ? new Date(original.endDate).toISOFormatDateString() : '-'}
          </span>
        );
      },
    },
    {
      accessorKey: "days",
      header: "Days",
      cell: (row) => {
        const original = row.row.original;
        return (
          <span>
            {original.noOfDays ?? '-'}
          </span>
        );
      },
    },
    {
      accessorKey: "roomRate",
      header: "Rates"
    },
    {
      accessorKey: "singleRate",
      header: "Single Rate"
    },
    {
      accessorKey: "roomSurcharge",
      header: "Rm Sur+"
    },
    {
      accessorKey: "seasonSurcharge",
      header: "Season Sur+"
    },
    {
      accessorKey: "totalRate",
      header: "Total Rates"
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount"
    },
    {
      accessorKey: "audit",
      header: "Created / Updated By",
      cell: (row) => {
        const original = row.row.original;
        return (
          <span>
            Created By:<br/>
             {original.createdByName || original.createdBy || '-'} @ {original.createdAtUTC ? new Date(original.createdAtUTC).toISODateTimeDisplayString() : '-'}
            <br />
            Updated By:<br/> {original.updatedByName || original.updatedBy || '-'} @ {original.updatedAtUTC ? new Date(original.updatedAtUTC).toISODateTimeDisplayString() : '-'}
          </span>
        );
      },
    },
    {
      accessorKey: "log_Id",
      header: "Log",
      cell: (row) => {
        const value = row.getValue() as string | number | null;
        const original = row.row.original;
        return (
          <span>
            #{value ?? ''} <br />
            {original.trigger || ''}<br />
            {original.triggerDateTimeUTC ? new Date(original.triggerDateTimeUTC).toISODateTimeDisplayString() : ''}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isPending} />
      <Group className="flex w-full">
        <GroupTitle>Room Charge Logs</GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4 items-end">
                <InputWithLabel label="Reservation ID" labelPosition="top" name="searchId" value={reservationId} onChange={(e) => setReservationId(e.target.value)} size="full" />                
                <ButtonCustom type="submit">Search</ButtonCustom>
              </div>
              <input type="hidden" name="location" value={location} />
            </form>
            <DataTable columns={columns} formState={state} formAction={formAction} formRef={formRef} />
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}
