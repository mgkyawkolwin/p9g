'use client';

import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import Customer from "@/core/models/domain/Customer";
import Reservation from "@/core/models/domain/Reservation";
import { Theme } from "@/core/constants";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../lib/components/web/react/ui/dialog";

interface CustomerHistoryDialogProps {
    customer: Customer | null;
    location: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const displayValue = (value: string | number | null | undefined) => value === null || value === undefined || value === "" ? "—" : String(value);

const formatDate = (value: Date | string | null | undefined) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("sv-SE");
};

export default function CustomerHistoryDialog({ customer, location, open, onOpenChange }: CustomerHistoryDialogProps) {
    const [reservations, setReservations] = React.useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const customerName = [customer?.englishName, customer?.name].filter(Boolean).join(" ") || "Customer";

    React.useEffect(() => {
        if (!open || !customer?.id) return;

        let cancelled = false;
        setIsLoading(true);
        setError("");

        fetch(`/api/customers/${encodeURIComponent(customer.id)}/reservations`, {
            headers: { "X-Resort-Location": location },
        })
            .then(async response => {
                const result = await response.json();
                if (!response.ok)
                    throw new Error(result.message || "Unable to load reservation history.");
                if (!cancelled)
                    setReservations(result.data?.reservations ?? []);
            })
            .catch(error => {
                if (!cancelled)
                    setError(error instanceof Error ? error.message : "Unable to load reservation history.");
            })
            .finally(() => {
                if (!cancelled)
                    setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customer?.id, location, open]);

    const copyReservationId = (id: string) => {
        navigator.clipboard.writeText(id)
            .then(() => toast("Reservation ID copied"))
            .catch(() => toast("Unable to copy reservation ID"));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "flex-start",
                    minWidth: "96vw",
                    width: "96vw",
                    maxWidth: "96vw",
                    height: "90vh",
                    maxHeight: "90vh",
                }}
                className="overflow-hidden p-0"
            >
                <DialogHeader className="shrink-0 border-b px-8 py-7">
                    <DialogTitle className="px-2 py-1">Reservation History</DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-auto px-6 pb-6 pt-2">
                    {isLoading && <p className="py-8 text-center text-sm text-gray-600">Loading reservations...</p>}
                    {error && <p role="alert" className="py-5 text-sm text-red-700">{error}</p>}
                    {!isLoading && !error && reservations.length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-600">No reservations found for this customer.</p>
                    )}
                    {!isLoading && !error && reservations.length > 0 && (
                        <table className={`w-full min-w-[1050px] border-collapse text-left text-sm ${Theme.Style.tableBg} ${Theme.Style.tableCellText}`}>
                            <thead className={`sticky top-0 z-10 text-xs font-semibold uppercase ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadText}`}>
                                <tr className="align-top">
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>Reservation ID</th>
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>Status</th>
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>Type</th>
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>Prepaid Package Type</th>
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>Customers</th>
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>Check In</th>
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>Check Out</th>
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>No. of Days</th>
                                    <th className={`border px-4 py-4 align-top ${Theme.Style.tableHeadBorder}`}>Pax</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(reservation => (
                                    <tr key={reservation.id} className="align-top">
                                        <td className={`whitespace-nowrap px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>
                                            <span>{reservation.id}</span>
                                            <button type="button" className="ml-2 inline-flex text-current opacity-70 hover:opacity-100" aria-label="Copy reservation ID"
                                                onClick={() => copyReservationId(reservation.id)}>
                                                <Copy aria-hidden="true" className="size-4" />
                                            </button>
                                        </td>
                                        <td className={`px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>{displayValue(reservation.reservationStatusText || reservation.reservationStatus)}</td>
                                        <td className={`px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>{displayValue(reservation.reservationTypeText || reservation.reservationType)}</td>
                                        <td className={`px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>{displayValue(reservation.prepaidPackageText || reservation.prepaidPackage)}</td>
                                        <td className={`px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>
                                            {reservation.customers?.length ? (
                                                <div className="flex flex-col gap-1">
                                                    {reservation.customers.map(item => (
                                                        <div key={item.id}>
                                                            {[item.englishName, item.name].filter(Boolean).join(" ") || "—"}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : "—"}
                                        </td>
                                        <td className={`whitespace-nowrap px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>{formatDate(reservation.checkInDate)}</td>
                                        <td className={`whitespace-nowrap px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>{formatDate(reservation.checkOutDate)}</td>
                                        <td className={`px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>{displayValue(reservation.noOfDays)}</td>
                                        <td className={`px-4 py-4 align-top ${Theme.Style.tableCellBorder}`}>{displayValue(reservation.noOfGuests)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}