"use client"

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import { invoiceGetById, invoiceUpdate } from "@/app/(private)/console/invoices/actions";
import { toast } from "sonner";
import Invoice from "@/core/models/domain/Invoice";
import BookingInvoiceItem from "@/core/models/domain/BookingInvoiceItem";
import SimpleInvoiceItem from "@/core/models/domain/SimpleInvoiceItem";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";
import { SelectCustom } from "../../../lib/components/web/react/uicustom/selectcustom";
import { Textarea } from "../../../lib/components/web/react/ui/textarea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import BillDataTable from "../../../lib/components/web/react/uicustom/billdatatable";
import { Trash } from "lucide-react";


interface InvoiceEditDialogProps {
    invoiceId: string;
    callbackFunctions: (func: {
        openDialog: (open: boolean) => void;
    }) => void;
    formRef: React.RefObject<HTMLFormElement | null>;
}

export default function InvoiceEditDialog({
    invoiceId,
    callbackFunctions,
    formRef
}: InvoiceEditDialogProps) {

    const [open, setOpen] = React.useState(false);
    const [invoice, setInvoice] = React.useState<Invoice | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [bookingItems, setBookingItems] = React.useState<BookingInvoiceItem[]>([]);
    const [simpleItems, setSimpleItems] = React.useState<SimpleInvoiceItem[]>([]);

    // ============ CALCULATION HELPER FUNCTIONS ============
    
    /**
     * Calculate number of days between two dates
     */
    const calculateNoOfDays = (startDate: Date | null | undefined, endDate: Date | null | undefined): number => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    /**
     * Calculate booking item amount based on rate, days, and pax
     */
    const calculateBookingAmount = (rate: number | undefined, noOfDays: number | undefined, pax: number | undefined): number => {
        const r = rate || 0;
        const d = noOfDays || 0;
        const p = pax || 0;
        return r * d * p;
    };

    /**
     * Sum all booking items KWR amounts
     */
    const sumBookingItemsKWR = (): number => {
        return bookingItems.reduce((sum, item) => sum + (item.amountKWR || 0), 0);
    };

    /**
     * Sum all booking items THB amounts
     */
    const sumBookingItemsTHB = (): number => {
        return bookingItems.reduce((sum, item) => sum + (item.amountTHB || 0), 0);
    };

    /**
     * Sum all simple items KWR amounts
     */
    const sumSimpleItemsKWR = (): number => {
        return simpleItems.reduce((sum, item) => sum + (item.amountKWR || 0), 0);
    };

    /**
     * Sum all simple items THB amounts
     */
    const sumSimpleItemsTHB = (): number => {
        return simpleItems.reduce((sum, item) => sum + (item.amountTHB || 0), 0);
    };

    /**
     * Validate and convert number input - default to 0 if invalid
     */
    const validateNumberInput = (value: string | number | undefined): number => {
        if (value === undefined || value === null || value === '') return 0;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? 0 : num;
    };

    /**
     * Update invoice totals based on item amounts
     */
    const updateInvoiceTotals = (updatedBookingItems?: BookingInvoiceItem[], updatedSimpleItems?: SimpleInvoiceItem[]) => {
        const bookingKWR = (updatedBookingItems || bookingItems).reduce((sum, item) => sum + (item.amountKWR || 0), 0);
        const bookingTHB = (updatedBookingItems || bookingItems).reduce((sum, item) => sum + (item.amountTHB || 0), 0);
        const simpleKWR = (updatedSimpleItems || simpleItems).reduce((sum, item) => sum + (item.amountKWR || 0), 0);
        const simpleTHB = (updatedSimpleItems || simpleItems).reduce((sum, item) => sum + (item.amountTHB || 0), 0);

        if (invoice) {
            const totalKWR = bookingKWR + simpleKWR;
            const totalTHB = bookingTHB + simpleTHB;
            const depositKWR = invoice.depositKWR || 0;
            const depositTHB = invoice.depositTHB || 0;

            setInvoice({
                ...invoice,
                totalAmountKWR: totalKWR,
                totalAmountTHB: totalTHB,
                dueAmountKWR: totalKWR - depositKWR,
                dueAmountTHB: totalTHB - depositTHB,
                modelState: 'updated'
            });
        }
    };

    const openDialog = (open: boolean) => {
        setOpen(open);
        if (open) {
            loadInvoice();
        }
    };

    React.useEffect(() => {
        if (callbackFunctions) {
            callbackFunctions({ openDialog });
        }
    }, [callbackFunctions]);

    const loadInvoice = async () => {
        setLoading(true);
        const result = await invoiceGetById(invoiceId);
        if (!result.error) {
            setInvoice(result.data);
            setBookingItems(result.data?.bookingItems || []);
            setSimpleItems(result.data?.simpleItems || []);
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleInputChange = (field: string, value: string | Date | number | undefined) => {
        if (invoice) {
            let numValue: any = value;
            if (field === 'depositKWR' || field === 'depositTHB') {
                numValue = validateNumberInput(typeof value === 'string' || typeof value === 'number' ? value : 0);
            }
            
            const updatedInvoice: Invoice = {
                ...invoice,
                [field]: numValue,
                modelState: 'updated'
            };

            // Recalculate due amounts if deposit changed
            if (field === 'depositKWR') {
                updatedInvoice.dueAmountKWR = (updatedInvoice.totalAmountKWR || 0) - (numValue as number);
            } else if (field === 'depositTHB') {
                updatedInvoice.dueAmountTHB = (updatedInvoice.totalAmountTHB || 0) - (numValue as number);
            }

            setInvoice(updatedInvoice);
        }
    };

    const handleSave = async () => {
        if (!invoice) return;

        // Update invoice with current items
        const updatedInvoice = {
            ...invoice,
            bookingItems: bookingItems,
            simpleItems: simpleItems,
            modelState: 'updated' as const
        };

        setIsSaving(true);
        const result = await invoiceUpdate(invoiceId, updatedInvoice);
        setIsSaving(false);

        if (result.error) {
            toast.error(result.message);
        } else {
            toast.success(result.message);
            setOpen(false);
            // Refresh the list
            formRef?.current?.requestSubmit();
        }
    };

    // Booking Items handlers
    const handleBookingItemChange = (rowIndex: number, field: string, value: any) => {
        const updatedItems = bookingItems.map((item, index) => {
            if (index !== rowIndex) return item;

            let updatedItem: BookingInvoiceItem = {
                ...item,
                [field]: value,
                modelState: item.modelState === "inserted" ? "inserted" : "updated"
            };

            // Auto-calculate noOfDays when dates change
            if (field === 'startDate' || field === 'endDate') {
                const startDate = field === 'startDate' ? value : item.startDate;
                const endDate = field === 'endDate' ? value : item.endDate;
                updatedItem.noOfDays = calculateNoOfDays(startDate, endDate);

                // Auto-calculate amounts when days are calculated
                updatedItem.amountKWR = calculateBookingAmount(updatedItem.rateKWR, updatedItem.noOfDays, updatedItem.pax);
                updatedItem.amountTHB = calculateBookingAmount(updatedItem.rateTHB, updatedItem.noOfDays, updatedItem.pax);
            }

            // Auto-calculate amounts when rate, days, or pax change
            if (field === 'rateKWR' || field === 'noOfDays' || field === 'pax') {
                updatedItem.amountKWR = calculateBookingAmount(updatedItem.rateKWR, updatedItem.noOfDays, updatedItem.pax);
            }
            if (field === 'rateTHB' || field === 'noOfDays' || field === 'pax') {
                updatedItem.amountTHB = calculateBookingAmount(updatedItem.rateTHB, updatedItem.noOfDays, updatedItem.pax);
            }

            return updatedItem;
        });

        setBookingItems(updatedItems);
        updateInvoiceTotals(updatedItems, simpleItems);
    };

    const addBookingItem = () => {
        const newItem = new BookingInvoiceItem();
        newItem.modelState = "inserted";
        newItem.rateKWR = 0;
        newItem.rateTHB = 0;
        newItem.noOfDays = 0;
        newItem.pax = 0;
        newItem.noOfRooms = 0;
        newItem.amountKWR = 0;
        newItem.amountTHB = 0;
        const updatedItems = [...bookingItems, newItem];
        setBookingItems(updatedItems);
        updateInvoiceTotals(updatedItems, simpleItems);
    };

    const deleteBookingItem = (rowIndex: number) => {
        const updatedItems = bookingItems.filter((_, index) => index !== rowIndex);
        setBookingItems(updatedItems);
        updateInvoiceTotals(updatedItems, simpleItems);
    };

    // Simple Items handlers
    const handleSimpleItemChange = (rowIndex: number, field: string, value: any) => {
        const updatedItems = simpleItems.map((item, index) => {
            if (index !== rowIndex) return item;

            const updatedItem: SimpleInvoiceItem = {
                ...item,
                [field]: field === 'amountKWR' || field === 'amountTHB' ? validateNumberInput(value) : value,
                modelState: item.modelState === "inserted" ? "inserted" : "updated"
            };

            return updatedItem;
        });

        setSimpleItems(updatedItems);
        updateInvoiceTotals(bookingItems, updatedItems);
    };

    const addSimpleItem = () => {
        const newItem = new SimpleInvoiceItem();
        newItem.modelState = "inserted";
        newItem.amountKWR = 0;
        newItem.amountTHB = 0;
        const updatedItems = [...simpleItems, newItem];
        setSimpleItems(updatedItems);
        updateInvoiceTotals(bookingItems, updatedItems);
    };

    const deleteSimpleItem = (rowIndex: number) => {
        const updatedItems = simpleItems.filter((_, index) => index !== rowIndex);
        setSimpleItems(updatedItems);
        updateInvoiceTotals(bookingItems, updatedItems);
    };

    const invoiceStatusItems = new Map<string, string>([
        ["DRAFT", "Draft"],
        ["SENT", "Sent"],
        ["PAID", "Paid"],
        ["OVERDUE", "Overdue"],
        ["CANCELLED", "Cancelled"]
    ]);

    const locationItems = new Map<string, string>([
        ["MIDA", "MIDA"],
        ["KKC", "KKC"]
    ]);

    const bookingItemsColumns = React.useMemo<ColumnDef<BookingInvoiceItem>[]>(() => [
        {
            accessorKey: "index",
            header: "#",
            accessorFn: (row, index) => index + 1,
            cell: row => row.getValue()
        },
        {
            accessorKey: "description",
            header: 'Description',
            cell: (row) => <InputCustom
                size="sm"
                key={`booking-desc-${row.row.original.id}`}
                value={row.row.original.description}
                onChange={e => handleBookingItemChange(row.row.index, "description", e.target.value)}
            />
        },
        {
            accessorKey: "startDate",
            header: 'Start Date',
            cell: (row) => <DatePicker
                key={`booking-start-${row.row.original.id}`}
                selected={row.row.original.startDate}
                onChange={(date: Date | null) => handleBookingItemChange(row.row.index, "startDate", date)}
                dateFormat="yyyy-MM-dd"
                customInput={<InputCustom size="sm" />}
                isClearable
                showIcon
            />
        },
        {
            accessorKey: "endDate",
            header: 'End Date',
            cell: (row) => <DatePicker
                key={`booking-end-${row.row.original.id}`}
                selected={row.row.original.endDate}
                onChange={(date: Date | null) => handleBookingItemChange(row.row.index, "endDate", date)}
                dateFormat="yyyy-MM-dd"
                customInput={<InputCustom size="sm" />}
                isClearable
                showIcon
            />
        },
        {
            accessorKey: "location",
            header: 'Location',
            cell: (row) => <SelectCustom
                size="sm"
                key={`booking-loc-${row.row.original.id}`}
                items={locationItems}
                value={row.row.original.location || ""}
                onValueChange={(value) => handleBookingItemChange(row.row.index, "location", value)}
            />
        },
        {
            accessorKey: "pax",
            header: 'Pax',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`booking-pax-${row.row.original.id}`}
                value={row.row.original.pax || 0}
                onChange={e => handleBookingItemChange(row.row.index, "pax", validateNumberInput(e.target.value))}
                onBlur={e => handleBookingItemChange(row.row.index, "pax", validateNumberInput(e.target.value))}
            />
        },
        {
            accessorKey: "noOfDays",
            header: 'No. of Days',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`booking-days-${row.row.original.id}`}
                value={row.row.original.noOfDays || 0}
                onChange={e => handleBookingItemChange(row.row.index, "noOfDays", validateNumberInput(e.target.value))}
            />
        },
        {
            accessorKey: "noOfRooms",
            header: 'No. of Rooms',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`booking-rooms-${row.row.original.id}`}
                value={row.row.original.noOfRooms || 0}
                onChange={e => handleBookingItemChange(row.row.index, "noOfRooms", validateNumberInput(e.target.value))}
            />
        },
        {
            accessorKey: "rateKWR",
            header: 'Rate KWR',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`booking-rateKWR-${row.row.original.id}`}
                value={row.row.original.rateKWR || 0}
                onChange={e => handleBookingItemChange(row.row.index, "rateKWR", validateNumberInput(e.target.value))}
                onBlur={e => handleBookingItemChange(row.row.index, "rateKWR", validateNumberInput(e.target.value))}
            />
        },
        {
            accessorKey: "amountKWR",
            header: 'Amount KWR',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`booking-amountKWR-${row.row.original.id}`}
                value={row.row.original.amountKWR || 0}
                onChange={e => handleBookingItemChange(row.row.index, "amountKWR", validateNumberInput(e.target.value))}
                disabled
            />
        },
        {
            accessorKey: "rateTHB",
            header: 'Rate THB',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`booking-rateTHB-${row.row.original.id}`}
                value={row.row.original.rateTHB || 0}
                onChange={e => handleBookingItemChange(row.row.index, "rateTHB", validateNumberInput(e.target.value))}
                onBlur={e => handleBookingItemChange(row.row.index, "rateTHB", validateNumberInput(e.target.value))}
            />
        },
        {
            accessorKey: "amountTHB",
            header: 'Amount THB',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`booking-amountTHB-${row.row.original.id}`}
                value={row.row.original.amountTHB || 0}
                onChange={e => handleBookingItemChange(row.row.index, "amountTHB", validateNumberInput(e.target.value))}
                disabled
            />
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: (row) => (
                <button
                    type="button"
                    onClick={() => deleteBookingItem(row.row.index)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash className="w-4 h-4" />
                </button>
            )
        }
    ], [bookingItems]);

    const simpleItemsColumns = React.useMemo<ColumnDef<SimpleInvoiceItem>[]>(() => [
        {
            accessorKey: "index",
            header: "#",
            accessorFn: (row, index) => index + 1,
            cell: row => row.getValue()
        },
        {
            accessorKey: "description",
            header: 'Description',
            cell: (row) => <InputCustom
                size="sm"
                key={`simple-desc-${row.row.original.id}`}
                value={row.row.original.description}
                onChange={e => handleSimpleItemChange(row.row.index, "description", e.target.value)}
            />
        },
        {
            accessorKey: "amountKWR",
            header: 'Amount KWR',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`simple-amountKWR-${row.row.original.id}`}
                value={row.row.original.amountKWR || 0}
                onChange={e => handleSimpleItemChange(row.row.index, "amountKWR", validateNumberInput(e.target.value))}
                onBlur={e => handleSimpleItemChange(row.row.index, "amountKWR", validateNumberInput(e.target.value))}
            />
        },
        {
            accessorKey: "amountTHB",
            header: 'Amount THB',
            cell: (row) => <InputCustom
                size="sm"
                type="number"
                key={`simple-amountTHB-${row.row.original.id}`}
                value={row.row.original.amountTHB || 0}
                onChange={e => handleSimpleItemChange(row.row.index, "amountTHB", validateNumberInput(e.target.value))}
                onBlur={e => handleSimpleItemChange(row.row.index, "amountTHB", validateNumberInput(e.target.value))}
            />
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: (row) => (
                <button
                    type="button"
                    onClick={() => deleteSimpleItem(row.row.index)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash className="w-4 h-4" />
                </button>
            )
        }
    ], [simpleItems]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] min-w-[90vw] overflow-y-auto">
                <Loader isLoading={loading || isSaving} />
                <DialogHeader>
                    <DialogTitle>Edit Invoice</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>

                {invoice && (
                    <div className="flex flex-col gap-6">
                        {/* General Fields Section */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold mb-4">General Information</h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Invoice Number</label>
                                    <InputCustom
                                        size="md"
                                        value={invoice.invoiceNumber}
                                        onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Invoice Date</label>
                                    <DatePicker
                                        selected={invoice.invoiceDate}
                                        onChange={(date: Date | null) => handleInputChange("invoiceDate", date)}
                                        dateFormat="yyyy-MM-dd"
                                        customInput={<InputCustom size="md" />}
                                        placeholderText="yyyy-mm-dd"
                                        isClearable={true}
                                        showIcon
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Agent Name</label>
                                    <InputCustom
                                        size="md"
                                        value={invoice.agentName || ""}
                                        onChange={(e) => handleInputChange("agentName", e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Customer Name</label>
                                    <InputCustom
                                        size="md"
                                        value={invoice.customerName}
                                        onChange={(e) => handleInputChange("customerName", e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <SelectCustom
                                        size="md"
                                        items={invoiceStatusItems}
                                        value={invoice.status}
                                        onValueChange={(value) => handleInputChange("status", value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Pax</label>
                                    <InputCustom
                                        size="md"
                                        value={invoice.pax || ""}
                                        onChange={(e) => handleInputChange("pax", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Booking Items Section */}
                        <div className="border-b pb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Booking Items</h3>
                                <ButtonCustom
                                    type="button"
                                    variant="green"
                                    size="sm"
                                    onClick={addBookingItem}
                                >
                                    Add New Row
                                </ButtonCustom>
                            </div>
                            {bookingItems.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <BillDataTable columns={bookingItemsColumns} data={bookingItems} />
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">No booking items added yet</div>
                            )}
                        </div>

                        {/* Simple Items Section */}
                        <div className="border-b pb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Simple Items</h3>
                                <ButtonCustom
                                    type="button"
                                    variant="green"
                                    size="sm"
                                    onClick={addSimpleItem}
                                >
                                    Add New Row
                                </ButtonCustom>
                            </div>
                            {simpleItems.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <BillDataTable columns={simpleItemsColumns} data={simpleItems} />
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">No simple items added yet</div>
                            )}
                        </div>

                        {/* Amount Fields Section */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-4">Amount Details</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {/* KWR Section */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Total Amount (KWR)</label>
                                    <InputCustom
                                        size="md"
                                        type="number"
                                        value={invoice.totalAmountKWR || 0}
                                        onChange={(e) => handleInputChange("totalAmountKWR", validateNumberInput(e.target.value))}
                                        disabled
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Deposit (KWR)</label>
                                    <InputCustom
                                        size="md"
                                        type="number"
                                        value={invoice.depositKWR || 0}
                                        onChange={(e) => handleInputChange("depositKWR", validateNumberInput(e.target.value))}
                                        onBlur={(e) => handleInputChange("depositKWR", validateNumberInput(e.target.value))}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Due Amount (KWR)</label>
                                    <InputCustom
                                        size="md"
                                        type="number"
                                        value={invoice.dueAmountKWR || 0}
                                        onChange={(e) => handleInputChange("dueAmountKWR", validateNumberInput(e.target.value))}
                                        disabled
                                    />
                                </div>

                                {/* THB Section */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Total Amount (THB)</label>
                                    <InputCustom
                                        size="md"
                                        type="number"
                                        value={invoice.totalAmountTHB || 0}
                                        onChange={(e) => handleInputChange("totalAmountTHB", validateNumberInput(e.target.value))}
                                        disabled
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Deposit (THB)</label>
                                    <InputCustom
                                        size="md"
                                        type="number"
                                        value={invoice.depositTHB || 0}
                                        onChange={(e) => handleInputChange("depositTHB", validateNumberInput(e.target.value))}
                                        onBlur={(e) => handleInputChange("depositTHB", validateNumberInput(e.target.value))}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Due Amount (THB)</label>
                                    <InputCustom
                                        size="md"
                                        type="number"
                                        value={invoice.dueAmountTHB || 0}
                                        onChange={(e) => handleInputChange("dueAmountTHB", validateNumberInput(e.target.value))}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row gap-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Included Items</label>
                                <Textarea
                                    value={invoice.included}
                                    onChange={(e) => handleInputChange("included", e.target.value)}
                                    placeholder="Enter included items..."
                                    className="min-h-[80px]"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Not Included Items</label>
                                <Textarea
                                    value={invoice.notIncluded}
                                    onChange={(e) => handleInputChange("notIncluded", e.target.value)}
                                    placeholder="Enter not included items..."
                                    className="min-h-[80px]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <ButtonCustom variant="default" size="default">
                            Cancel
                        </ButtonCustom>
                    </DialogClose>
                    <ButtonCustom
                        variant="green"
                        size="default"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        Save Changes
                    </ButtonCustom>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
