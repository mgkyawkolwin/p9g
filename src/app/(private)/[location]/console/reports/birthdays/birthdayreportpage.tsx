"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import React from "react";
import { useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import DataTable from "@/lib/components/web/react/uicustom/datatable";
import { birthdayReportGetList } from "./actions";

export default function BirthdayReportPage() {
    const params = useParams();
    const location = params.location as string;

    const formRef = React.useRef<HTMLFormElement>(null);
    const [today] = React.useState<string>(() => new Date().toLocaleDateString('sv-SE'));

    const [state, formAction, isPending] = useActionState(birthdayReportGetList, {
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
            header: "Reservation ID",
            cell: (row) => {
                const original = row.row.original;
                return <a href={`/${location}/console/reservations/${original.reservationId}/edit`}>{original.reservationId}</a>;
            },
        },
        {
            accessorKey: "customerName",
            header: "Customer Name",
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "englishName",
            header: "English Name",
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "dob",
            header: "DOB",
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "roomNo",
            header: "Room No",
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "birthdayStatus",
            header: "Status",
            cell: (row) => {
                const value = row.getValue() as string;
                return <span className={value === 'Today' ? 'font-bold text-[#ff0000]' : value === 'Tomorrow' ? 'font-bold text-[#ff8c00]' : ''}>{value}</span>;
            },
        },
    ];

    return (
        <div className="flex flex-1 w-auto">
            <Loader isLoading={isPending} />
            <Group className="flex w-full">
                <GroupTitle>Birthdays</GroupTitle>
                <GroupContent>
                    <div className="flex flex-col gap-4">
                        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
                            <input type="hidden" name="location" value={location} />
                            <input type="hidden" name="date" value={today} />
                        </form>
                        <DataTable columns={columns} formState={state} formAction={formAction} formRef={formRef} />
                    </div>
                </GroupContent>
            </Group>
        </div>
    );
}
