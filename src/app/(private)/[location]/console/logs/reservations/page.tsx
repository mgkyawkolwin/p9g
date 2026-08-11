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
import { reservationLogGetList } from "./actions";
import { CopyIcon } from "lucide-react";
import { getReservationStatusColorClass } from "@/core/helpers";

export default function ReservationLogPage() {
    const params = useParams();
    const location = params.location as string;

    const formRef = React.useRef<HTMLFormElement>(null);
    const [reservationId, setReservationId] = React.useState<string>("");

    const [state, formAction, isPending] = useActionState(reservationLogGetList, {
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

    const getInvoiceStatusColorClass = (status?: string | null) => {
        if (!status) return '';
        const normalized = status.toLowerCase();
        if (normalized.includes('sent')) return 'text-[#00a000]';
        if (normalized.includes('not_required')) return 'text-[#ff0000]';
        return '';
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "Reservation",
            cell: (row) => {
                const original = row.row.original;

                return (
                    <span>
                        <div className="whitespace-nowrap"><a href={`/${location}/console/reservations/${original.id}/edit`}>{original.id.substring(0, 8)}</a>&nbsp;&nbsp;&nbsp;<CopyIcon className="inline w-[20px] cursor-pointer" onClick={e => navigator.clipboard.writeText(original.id)} /></div>
                        <span className={`font-bold ${getReservationStatusColorClass(original.reservationStatus)}`}>{original.reservationStatus}</span><br />
                        <span>{original.reservationType}</span>
                        {original.prepaidPackageText ? <span className="font-bold text-[#ff00ff] dark:text-[#ff00ff]"><br />{original.prepaidPackageText}</span> : ''}
                        {original.promotionPackageText ? <span className="font-bold text-[#dd5500] dark:text-[#ff9911]"><br />{original.promotionPackageText}</span> : ''}
                        <br />
                        <span className={`font-bold cursor-pointer ${getInvoiceStatusColorClass(original.invoiceStatusText || original.invoiceStatus)}`} >Invoice <br />({original.invoiceStatusText || original.invoiceStatus || 'Not Required'})</span>
                        {original.invoiceNumber ? <><br /><span className="text-sm">#{original.invoiceNumber}</span></> : null}
                    </span>
                );
            },
        },
        {
            accessorKey: "arrivalDeparture",
            header: "Arrival / Departure",
            accessorFn: (row) => {
                return <span>
                    {row.arrivalDateTime ? new Date(row.arrivalDateTime).toISODateTimeDisplayString() : ''} {row.arrivalFlight} {row.pickUpTypeText}<br />
                    {row.departureDateTime ? new Date(row.departureDateTime).toISODateTimeDisplayString() : ''} {row.departureFlight} {row.dropOffTypeText}</span>;
            },
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "checkInCheckOut",
            header: "Check-In / Check-Out",
            accessorFn: (row) => {
                return <span>
                    {new Date(row.checkInDate!).toISOFormatDateString()}<br />
                    {new Date(row.checkOutDate!).toISOFormatDateString()}<br />
                    {row.noOfDays} days, {row.noOfGuests ? row.noOfGuests + ' pax(s)' : ''}, {row.roomNo}</span>;
            },
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "remarks",
            header: "Notes",
            cell: (row) => {
                const original = row.row.original;
                return (
                    <span className="flex flex-col min-w-[200px] max-w-[200px] whitespace-normal">
                        Remark: {original.remark || '-'}<br />
                        Payment Remark: {original.paymentRemark || '-'}
                    </span>
                );
            },
        },
        {
            accessorKey: "depositInfo",
            header: "Deposit",
            accessorFn: (row) => {
                return <span>{row.depositAmount > 0 ? row.depositAmount : ''}<br />{row.depositAmountInCurrency > 0 ? row.depositAmountInCurrency + ' ' + row.depositCurrency : ''} <br /> {row.depositAmount > 0 ? row.depositPaymentMode : ''} <br /> {row.depositDateUTC ? new Date(row.depositDateUTC).toLocaleDateString('sv-SE') : ""}</span>;
            },
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "amountInfo",
            header: "Amount",
            accessorFn: (row) => {
                return <span>
                    Total: {row.totalAmount} <br/>
                    Paid: {row.paidAmount} <br/>
                    Discount: {row.discountAmount} <br/>
                    Tax: {row.taxAmount} <br/>
                    Net: {row.netAmount} <br/>
                    Due: {row.dueAmount} <br/>
                </span>;
            },
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "by",
            header: "By",
            cell: (row) => {
                const original = row.row.original;
                return (
                    <span>
                        Created: <br/>
                        {original.createdByName || original.createdBy} @ {original.createdAtUTC ? new Date(original.createdAtUTC).toLocaleString() : '-'} <br />
                        Updated: <br/>
                        {original.updatedByName || original.updatedBy} @ {original.updatedAtUTC ? new Date(original.updatedAtUTC).toLocaleString() : '-'} <br />
                        Location: {original.location} <br />
                        Golf Cart: {original.golfCart || '-'}
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
                        Trigger: {original.trigger} <br />
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
                <GroupTitle>Reservation Logs</GroupTitle>
                <GroupContent>
                    <div className="flex flex-col gap-4">
                        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-4 items-end">
                                <InputWithLabel label="Reservation ID" labelPosition="top" name="searchId" value={reservationId} onChange={(e) => setReservationId(e.target.value)} size="full" />
                                <ButtonCustom type="submit">
                                    Search
                                </ButtonCustom>
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
