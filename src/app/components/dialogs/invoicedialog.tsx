"use client"

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import { invoiceGetById, invoiceUpdate, invoiceCreate } from "@/app/(private)/console/invoices/actions";
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
import { calculateDayDifference } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

interface InvoiceDialogProps {
    invoiceId?: string;
    isOpen: boolean;
    isNew?: boolean;
    formRef: React.RefObject<HTMLFormElement | null>;
    onOpenChanged: () => void;
}

export default function InvoiceDialog({
    invoiceId,
    isOpen,
    isNew = false,
    formRef,
    onOpenChanged
}: InvoiceDialogProps) {

    const [open, setOpen] = React.useState(isOpen);
    const [invoice, setInvoice] = React.useState<Invoice | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [bookingItems, setBookingItems] = React.useState<BookingInvoiceItem[]>([]);
    const [simpleItems, setSimpleItems] = React.useState<SimpleInvoiceItem[]>([]);

    // Only show items that are not marked as deleted, but keep original array index for mapping back
    const visibleBookingItems = bookingItems
        .map((it, idx) => ({ __originalIndex: idx, ...it }))
        .filter((i: any) => i.modelState !== 'deleted');
    const visibleSimpleItems = simpleItems
        .map((it, idx) => ({ __originalIndex: idx, ...it }))
        .filter((i: any) => i.modelState !== 'deleted');

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
     * Validate and convert number input - default to 0 if invalid
     * This is the key fix: same behavior as BillEditDialog
     */
    const validateNumberInput = (value: string | number | undefined): number => {
        if (value === undefined || value === null || value === '') return 0;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? 0 : num;
    };

    /**
     * Helper to convert string to number like BillEditDialog does
     * Handles cases like "0023" -> 23, alphabets -> 0
     */
    const convertToNumber = (value: string | number): number => {
        if (typeof value === 'number') return value;
        if (value === '' || value === null || value === undefined) return 0;

        // Remove leading zeros and convert
        const trimmed = value.toString().trim();
        const num = parseFloat(trimmed);
        return isNaN(num) ? 0 : num;
    };

    /**
     * Update invoice totals based on item amounts
     */
    const updateInvoiceTotals = (updatedBookingItems?: BookingInvoiceItem[], updatedSimpleItems?: SimpleInvoiceItem[]) => {
        if (!invoice) return;

        // exclude deleted items from totals
        const bookingList = (updatedBookingItems || bookingItems).filter(i => i.modelState !== 'deleted');
        const simpleList = (updatedSimpleItems || simpleItems).filter(i => i.modelState !== 'deleted');

        const bookingKWR = bookingList.reduce((sum, item) => convertToNumber(sum) + convertToNumber(item.amountKWR), 0);
        const bookingTHB = bookingList.reduce((sum, item) => convertToNumber(sum) + convertToNumber(item.amountTHB), 0);
        const simpleKWR = simpleList.reduce((sum, item) => convertToNumber(sum) + convertToNumber(item.amountKWR), 0);
        const simpleTHB = simpleList.reduce((sum, item) => convertToNumber(sum) + convertToNumber(item.amountTHB), 0);

        const totalKWR = convertToNumber(bookingKWR) + convertToNumber(simpleKWR);
        const totalTHB = convertToNumber(bookingTHB) + convertToNumber(simpleTHB);
        const depositKWR = convertToNumber(invoice.depositKWR);
        const depositTHB = convertToNumber(invoice.depositTHB);

        setInvoice({
            ...invoice,
            totalAmountKWR: totalKWR,
            totalAmountTHB: totalTHB,
            dueAmountKWR: totalKWR - depositKWR,
            dueAmountTHB: totalTHB - depositTHB,
            modelState: invoice.modelState === "inserted" ? "inserted" : "updated"
        });
    };

    const openDialog = (open: boolean) => {
        setOpen(open);
        if (open) {
            if (isNew) {
                loadNewInvoice();
            } else {
                loadInvoice();
            }
        }
    };

    React.useEffect(() => {
        setOpen(isOpen);
        if (isOpen) {
            if (isNew) {
                loadNewInvoice();
            } else {
                loadInvoice();
            }
        }
    }, [isOpen]);

    // React.useEffect(() => {
    //     if (callbackFunctions) {
    //         callbackFunctions({ openDialog });
    //     }
    // }, [callbackFunctions, invoiceId, isNew]);

    const loadNewInvoice = () => {
        const newInvoice = new Invoice();
        newInvoice.id = uuidv4();
        newInvoice.invoiceDate = new Date();
        newInvoice.status = 'DRAFT';
        newInvoice.simpleItems = [];
        newInvoice.bookingItems = [];
        newInvoice.modelState = 'inserted';
        newInvoice.included = `*숙박 : Standard Superior (2인1실)<br/>*식사 : 전일정 한식뷔페<br/>*무제한그린피, 무제한 2인1 카트 포함`;
        newInvoice.notIncluded = encodeHTML(`<table style="width:100%;border: 0;"><tr><td style="width:45%;border: 0;">
        <span style="color: #000; font-weight: bold;">🚐 미팅 & 샌딩 (편도 / 1인 기준)</span><br/>
    <table class="c">
        <thead><tr>
                <th>인원</th>
                <th>요금 (1인 기준)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1인</td>
                <td>USD 100</td>
            </tr>
            <tr>
                <td>2인</td>
                <td>USD 50</td>
            </tr>
            <tr>
                <td>3인</td>
                <td>USD 35</td>
            </tr>
            <tr>
                <td>4인 이상 (최대 6명)</td>
                <td>USD 25</td>
            </tr>
        </tbody>
    </table><br/>
        </td>
        <td style="border: 0;">
        <span style="color: #000; font-weight: bold;">🏌 캐디 (2인 1캐디)</span>
    <table class="c">
        <thead>
            <tr>
                <th>항목</th>
                <th>요금</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>캐디피 + 캐디팁</td>
                <td>700 THB</td>
            </tr>
        </tbody>
    </table><br/>
        </td>
        </tr>
        <tr>
        <td style="border: 0;">
        <span style="color: #000; font-weight: bold;">🛏 싱글룸 (1인 1일 기준)</span>
    <table class="c" style=" border-collapse: collapse; font-size: 10pt;">
        <thead>
            <tr>
                <th>시즌</th>
                <th>요금</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>12월 · 1월 · 2월</td>
                <td>KRW 30,000</td>
            </tr>
            <tr>
                <td>3월 ~ 11월</td>
                <td>KRW 20,000</td>
            </tr>
        </tbody>
    </table><br/>
        </td>
        <td style="border: 0;">
        <span style="color: #000; font-weight: bold;">🚗 싱글카트</span>
    <table class="c">
        <thead>
            <tr>
                <th>골프장</th>
                <th>내용</th>
                <th>요금</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>마이다 CC</td>
                <td>싱글룸 이용 시 싱글카트 포함</td>
                <td>추가 없음</td>
            </tr>
            <tr>
                <td>캥카찬 CC</td>
                <td>싱글카트 별도 사용 시</td>
                <td>600 THB / 1일</td>
            </tr>
        </tbody>
    </table><br/>
        </td>
        </tr>
        <tr>
        <td style="border: 0;">
        <span style="color: #000; font-weight: bold;">🏨 Room Upgrade (마이다)</span>
    <table class="c" style="border-collapse: collapse; font-size: 10pt;padding:15px">
        <thead>
            <tr>
                <th>객실 타입</th>
                <th>요금</th>
            </tr>
        </thead>
        <tbody style="padding:15px;">
            <tr>
                <td>Modern Deluxe</td>
                <td>KRW 10,000 / 1인 1일</td>
            </tr>
        </tbody>
    </table><br/>
        </td>
        <td style="border: 0;">
        <span style="color: #000; font-weight: bold;">예약 문의 안내</span><br/>
    <span style="font-size: 9pt;">📞 가인 010-8173-2127</span><br/>
    <span style="font-size: 9pt;">📞 지은 010-8186-2127</span><br/>
    <span style="font-size: 9pt;">📞 가을 010-8178-2127</span><br/>
    <span style="font-size: 9pt;">📞 사무실 010-8185-2125 / 010-8174-2127</span>
        </td>
        </tr>
        </table>`);
        setInvoice(newInvoice);
        setBookingItems([]);
        setSimpleItems([]);
    };

    const loadInvoice = async () => {
        if (!invoiceId) return;
        setLoading(true);
        const result = await invoiceGetById(invoiceId);
        if (!result.error && result.data) {
            // Ensure all numeric fields are properly initialized
            const invoiceData = {
                ...result.data,
                totalAmountKWR: result.data.totalAmountKWR || 0,
                totalAmountTHB: result.data.totalAmountTHB || 0,
                depositKWR: result.data.depositKWR || 0,
                depositTHB: result.data.depositTHB || 0,
                dueAmountKWR: result.data.dueAmountKWR || 0,
                dueAmountTHB: result.data.dueAmountTHB || 0
            };

            setInvoice(invoiceData);

            // Ensure booking items have proper defaults
            const bookingItemsWithDefaults = (result.data.bookingItems || []).map(item => ({
                ...item,
                rateKWR: item.rateKWR || 0,
                rateTHB: item.rateTHB || 0,
                noOfDays: item.noOfDays || 0,
                pax: item.pax || 0,
                noOfRooms: item.noOfRooms || 0,
                amountKWR: item.amountKWR || 0,
                amountTHB: item.amountTHB || 0
            }));

            // Ensure simple items have proper defaults
            const simpleItemsWithDefaults = (result.data.simpleItems || []).map(item => ({
                ...item,
                amountKWR: item.amountKWR || 0,
                amountTHB: item.amountTHB || 0
            }));

            setBookingItems(bookingItemsWithDefaults);
            setSimpleItems(simpleItemsWithDefaults);
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleInputChange = (field: string, value: string | Date | number | undefined) => {
        if (!invoice) return;

        let updatedValue: any = value;

        // Handle number fields with same conversion as BillEditDialog
        if (field === 'depositKWR' || field === 'depositTHB') {
            updatedValue = convertToNumber(value as string | number);
        }

        const updatedInvoice: Invoice = {
            ...invoice,
            [field]: updatedValue,
            modelState: invoice.modelState === "inserted" ? "inserted" : "updated"
        };

        // Recalculate due amounts if deposit changed
        if (field === 'depositKWR') {
            updatedInvoice.dueAmountKWR = (updatedInvoice.totalAmountKWR || 0) - updatedValue;
        } else if (field === 'depositTHB') {
            updatedInvoice.dueAmountTHB = (updatedInvoice.totalAmountTHB || 0) - updatedValue;
        }

        setInvoice(updatedInvoice);
    };

    const handleSave = async () => {
        if (!invoice) return;
        onOpenChanged();

        // Update invoice with current items
        const updatedInvoice = {
            ...invoice,
            bookingItems: bookingItems,
            simpleItems: simpleItems,
            modelState: isNew ? 'inserted' : 'updated'
        };

        setIsSaving(true);

        let result;
        if (isNew) {
            result = await invoiceCreate(updatedInvoice as Invoice);
        } else {
            result = await invoiceUpdate(invoiceId!, updatedInvoice as Invoice);
        }

        setIsSaving(false);

        if (result.error) {
            toast.error(result.message);
            onOpenChanged();
        } else {
            toast.success(result.message);
            // setOpen(false);
            // Refresh the list
            formRef?.current?.requestSubmit();
        }
    };

    // Booking Items handlers - Fixed to prevent values disappearing
    const handleBookingItemChange = (rowIndex: number, field: string, value: any) => {
        setBookingItems(prev => {
            const updatedItems = prev.map((item, index) => {
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
                    if (startDate && endDate) {
                        updatedItem.noOfDays = calculateDayDifference(startDate, endDate);
                    } else {
                        updatedItem.noOfDays = 0;
                    }

                    // Auto-calculate amounts when days are calculated
                    updatedItem.amountKWR = calculateBookingAmount(updatedItem.rateKWR, updatedItem.noOfDays, updatedItem.pax);
                    updatedItem.amountTHB = calculateBookingAmount(updatedItem.rateTHB, updatedItem.noOfDays, updatedItem.pax);
                }

                // Handle number conversions for numeric fields - FIXED
                if (field === 'rateKWR' || field === 'rateTHB' || field === 'pax' ||
                    field === 'noOfDays' || field === 'noOfRooms') {
                    const numValue = convertToNumber(value);
                    updatedItem[field] = numValue;

                    // Recalculate amounts if rate, days, or pax change
                    if (field === 'rateKWR' || field === 'noOfDays' || field === 'pax') {
                        updatedItem.amountKWR = calculateBookingAmount(
                            field === 'rateKWR' ? numValue : updatedItem.rateKWR,
                            field === 'noOfDays' ? numValue : updatedItem.noOfDays,
                            field === 'pax' ? numValue : updatedItem.pax
                        );
                    }
                    if (field === 'rateTHB' || field === 'noOfDays' || field === 'pax') {
                        updatedItem.amountTHB = calculateBookingAmount(
                            field === 'rateTHB' ? numValue : updatedItem.rateTHB,
                            field === 'noOfDays' ? numValue : updatedItem.noOfDays,
                            field === 'pax' ? numValue : updatedItem.pax
                        );
                    }
                }

                return updatedItem;
            });
            updateInvoiceTotals(updatedItems, simpleItems);
            return updatedItems;
        });
    };

    const addBookingItem = () => {
        const newItem = new BookingInvoiceItem();
        newItem.id = uuidv4();
        newItem.modelState = "inserted";
        newItem.rateKWR = 0;
        newItem.rateTHB = 0;
        newItem.noOfDays = 0;
        newItem.pax = 0;
        newItem.noOfRooms = 0;
        newItem.amountKWR = 0;
        newItem.amountTHB = 0;
        const updatedItems = [...bookingItems, newItem];
        setBookingItems(updatedItems as BookingInvoiceItem[]);
        updateInvoiceTotals(updatedItems as BookingInvoiceItem[], simpleItems);
    };

    const deleteBookingItem = (id: string) => {
        const item = bookingItems.find(item => item.id === id);
        if (!item) return;

        // if the item was newly inserted in UI and not persisted yet, remove it outright
        if (item.modelState === 'inserted') {
            setBookingItems(prev => {
                const updatedItems = prev.filter(x => x.id !== id);
                updateInvoiceTotals(updatedItems as BookingInvoiceItem[], simpleItems);
                return updatedItems as BookingInvoiceItem[];
            });
        } else {
            setBookingItems(prev => {
                const updatedItems = prev.map(it => it.id === id ? { ...it, modelState: 'deleted' } : it);
                updateInvoiceTotals(updatedItems.filter(i => i.modelState !== 'deleted') as BookingInvoiceItem[], simpleItems);
                return updatedItems as BookingInvoiceItem[];
            });
        }
    };

    // Simple Items handlers - Fixed with proper number conversion
    const handleSimpleItemChange = (rowIndex: number, field: string, value: any) => {
        setSimpleItems(prev => {
            const updatedItems = prev.map((item, index) => {
                if (index !== rowIndex) return item;

                const updatedItem: SimpleInvoiceItem = {
                    ...item,
                    modelState: item.modelState === "inserted" ? "inserted" : "updated"
                };

                // Handle number fields with same conversion logic
                if (field === 'amountKWR' || field === 'amountTHB') {
                    updatedItem[field] = convertToNumber(value);
                } else {
                    updatedItem[field] = value;
                }

                return updatedItem;
            });
            updateInvoiceTotals(bookingItems, updatedItems as SimpleInvoiceItem[]);
            return updatedItems;
        });
    };

    const addSimpleItem = () => {
        const newItem = new SimpleInvoiceItem();
        newItem.id = uuidv4();
        newItem.modelState = "inserted";
        newItem.amountKWR = 0;
        newItem.amountTHB = 0;
        const updatedItems = [...simpleItems, newItem];
        setSimpleItems(updatedItems as SimpleInvoiceItem[]);
        updateInvoiceTotals(bookingItems, updatedItems as SimpleInvoiceItem[]);
    };

    const deleteSimpleItem = (id: string) => {
        const item = simpleItems.find(item => item.id === id);
        if (!item) return;

        if (item.modelState === 'inserted') {
            const updatedItems = simpleItems.filter((x) => x.id !== id);
            setSimpleItems(prev => {
                const updatedItems = simpleItems.filter((x) => x.id !== id);
                updateInvoiceTotals(bookingItems, updatedItems as SimpleInvoiceItem[]);
                return updatedItems as SimpleInvoiceItem[];
            });

        } else {

            setSimpleItems(prev => {
                const updatedItems = prev.map(it => it.id === id ? { ...it, modelState: 'deleted' } : it);
                updateInvoiceTotals(bookingItems, updatedItems.filter(i => i.modelState !== 'deleted') as SimpleInvoiceItem[]);
                return updatedItems as SimpleInvoiceItem[];
            });
        }
    };

    function encodeHTML(html) {
        return html;
    }

    function decodeHTML(base64) {
       return base64;
    }

    const handlePrintInvoice = () => {
        if (!invoice) return;
        
        const address = `Mida Golf Club Kanchanaburi<br/>
            주소 : 123 moo7 Tambon Lad Ya, Kanchanaburi 71190<br/>
            Kaeng Krachan (KKC) Golf Club : <br/>
            19 M 2 Tayang-Kaengkrachan Rd Kaeng Krachan, Kaeng Krachan District, <br/>
            Phetchaburi 76130, Keng Kachan, Thailand, Phetchaburi<br/>
            연락처 - 01081862127, 01081852127, 01081782127,
            01081732127, 01081742127`;

        let table = `<table style="width:100%;border-collapse:collapse;font-size:10pt;">`;
        table += `<thead><tr>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;">#</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:left;background:#eee;">Description</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;width:70px;">Start Date</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;width:70px;">End Date</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;">Golf Course</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;">Pax</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;">Days</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;">Rate KWR</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;">Amount KWR</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;">Rate THB</th>` +
            `<th style="border:1px solid #666;padding:6px;text-align:right;background:#eee;">Amount THB</th>` +
            `</tr></thead><tbody>`;
            

        
        simpleItems.forEach((it, i) => {
            const desc = it.description || '';
            const amtK = it.amountKWR != null ? it.amountKWR : 0;
            const amtT = it.amountTHB != null ? it.amountTHB : 0;

            table += `<tr>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${i + 1}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:left;">${desc}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">` + `</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">` + `</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">` + `</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">` + `</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">` + `</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">` + `</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${amtK}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">` + `</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${amtT}</td>` +
                `</tr>`;
        });

        bookingItems.forEach((it, i) => {
            const offset = simpleItems.length;
            const idx = offset + i;
            const desc = `${it.description || ''}`;
            const pax = it.pax || '';
            const days = it.noOfDays || '';
            const rateK = it.rateKWR != null ? it.rateKWR : '';
            const amtK = it.amountKWR != null ? it.amountKWR : 0;
            const rateT = it.rateTHB != null ? it.rateTHB : '';
            const amtT = it.amountTHB != null ? it.amountTHB : 0;

            table += `<tr>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${idx + 1}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:left;">${desc}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${it.startDate ? new Date(it.startDate).toLocaleDateString('sv-SE') : ''}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${it.endDate ? new Date(it.endDate).toLocaleDateString('sv-SE') : ''}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${it.location}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${pax}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${days}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${rateK}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${amtK}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${rateT}</td>` +
                `<td style="border:1px solid #666;padding:6px;text-align:right;">${amtT}</td>` +
                `</tr>`;
        });

        table += `</tbody>`;
        table += `<tfoot>` +
            `<tr><td colspan="8" style="padding:6px;text-align:right;font-weight:bold;">Total Amount</td>` +
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;">${invoice.totalAmountKWR || 0}</td>`+
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;"></td>`+
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;">${invoice.totalAmountTHB || 0}</td>`+
            `</tr>` +
            `<tr><td colspan="8" style="padding:6px;text-align:right;font-weight:bold;">Deposit</td>` +
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;">${invoice.depositKWR || 0}</td>`+
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;"></td>`+
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;">${invoice.depositTHB || 0}</td>`+
            `</tr>` +
            `<tr><td colspan="8" style="padding:6px;text-align:right;font-weight:bold;">Due Amount</td>` +
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;">${invoice.dueAmountKWR || 0}</td>`+
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;"></td>`+
            `<td style="border:1px solid #666;padding:6px;text-align:right;font-weight:bold;">${invoice.dueAmountTHB || 0}</td>`+
            `</tr>` +
            `</tfoot>`;
        table += `</table>`;

        const includedHtml = invoice.included ? `<div style="margin-top:12px;"><strong>포함: </strong><div>${invoice.included.replace(/\n/g, '<br/>')}</div></div>` : '';
        const notIncludedHtml = invoice.notIncluded ? `<div style="margin-top:8px;"><strong>불포함 사항 안내: </strong><div>${invoice.notIncluded.replace(/\n/g, '')}</div></div>` : '';

        const header = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">` +
            `<div style="flex:1;"><img src="/p9glogowithtext.png" style="width:200px;"/></div>` +
            `<div style="flex:1;text-align:right;font-size:9pt;line-height:1.4;">` +
            `<div style="font-weight:bold;">Mida Golf Club Kanchanaburi</div>` +
            `<div>주소: 123 moo7 Tambon Lad Ya, Kanchanaburi 71190</div>` +
            `<div style="font-weight:bold;">Kaeng Krachan (KKC) Club</div>` +
            `<div>19 M 2 Tayang-Kaengkrachan Rd Kaeng Krachan District, Phetchaburi 76130</div>` +
            `<div>Tel: 01081862127, 01081852127</div>` +
            `</div>` +
            `</div>`;

        const centerLabel = `<div style="text-align:center;font-size:16pt;font-weight:bold;margin:12px 0 12px 0;text-decoration:underline;">예약 확정서</div>`;

        const invoiceInfo = `<table style="width:100%;font-size:10pt;margin-bottom:6px;border-collapse:collapse;">` +
            `<tr><td style="padding:4px;">예약번호: ${invoice.invoiceNumber || ''}</td><td style="text-align:right;padding:4px;">일자: ${invoice.invoiceDate ? (new Date(invoice.invoiceDate)).toLocaleDateString('sv-SE') : ''}</td></tr>` +
            `<tr><td style="padding:4px;">에이전트: ${invoice.agentName || ''}</td><td style="text-align:right;padding:4px;">예약 담당자: ${invoice.bookingPerson || ''}</td></tr>` +
            `<tr><td style="padding:4px;">예약자: ${invoice.customerName || ''}</td><td style="text-align:right;padding:4px;">예약 채널: ${invoice.bookingSource || ''}</td></tr>` +
            `<tr><td style="padding:4px;">인원: ${invoice.pax || ''}</td><td style="text-align:right;padding:4px;"></td></tr>` +
            `</table>`;

        const html = `<html><style>@media print{ @page {margin:0;} } table.c {border-collapse:collapse; margin: 10px 0 10px 0;font-size:10pt;} table.c thead tr th {background-color:#eee;} table.c tr td, table.c tr th {padding: 0 5px 0 5px; vertical-align:top;border: solid 1px #ccc;}</style><body style="padding:0.5in;font-family:Arial,Helvetica,sans-serif;font-size:10pt;">` +
            header +
            centerLabel +
            invoiceInfo +
            `<div>${table}</div>` +
            `<div style="margin-top:12px;">` + decodeHTML(includedHtml) + decodeHTML(notIncludedHtml) + `</div>` +
            `</body></html>`;

        const win = window.open('', 'Print', `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`);
        if (win) {
            win.document.open();
            win.document.writeln(html);
            win.document.close();
            win.focus();
            win.onload = function () {
                win.print();
                win.close();
            };
        }
    };

    const invoiceStatusItems = new Map<string, string>([
        ["DRAFT", "Draft"],
        ["SENT", "Sent"],
        ["PAID", "Paid"],
        ["OVERDUE", "Overdue"],
        ["CANCELLED", "Cancelled"]
    ]);

    const locationItems = new Map<string, string>([
        ["마이다", "마이다"],
        ["캥카찬", "캥카찬"]
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
                key={`booking-desc-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.description || ""}
                onChange={e => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "description", e.target.value)}
            />
        },
        {
            accessorKey: "startDate",
            header: 'Start Date',
            cell: (row) => <DatePicker
                key={`booking-start-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                selected={row.row.original.startDate}
                onChange={(date: Date | null) => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "startDate", date)}
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
                key={`booking-end-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                selected={row.row.original.endDate}
                onChange={(date: Date | null) => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "endDate", date)}
                dateFormat="yyyy-MM-dd"
                customInput={<InputCustom size="sm" />}
                isClearable
                showIcon
            />
        },
        {
            accessorKey: "location",
            header: 'Gof Course',
            cell: (row) => <SelectCustom
                size="xs"
                key={`booking-loc-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                items={locationItems}
                value={row.row.original.location || ""}
                onValueChange={(value) => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "location", value)}
            />
        },
        {
            accessorKey: "pax",
            header: 'Pax',
            cell: (row) => <InputCustom
                size="xs"
                key={`booking-pax-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.pax || 0}
                onChange={e => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "pax", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "noOfDays",
            header: 'Days',
            cell: (row) => <InputCustom
                size="xs"
                key={`booking-days-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.noOfDays || 0}
                onChange={e => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "noOfDays", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "noOfRooms",
            header: 'Rooms',
            cell: (row) => <InputCustom
                size="xs"
                key={`booking-rooms-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.noOfRooms || 0}
                onChange={e => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "noOfRooms", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "rateKWR",
            header: 'Rate KWR',
            cell: (row) => <InputCustom
                size="xs"
                key={`booking-rateKWR-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.rateKWR || 0}
                onChange={e => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "rateKWR", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "amountKWR",
            header: 'Amount KWR',
            cell: (row) => <InputCustom
                size="sm"
                key={`booking-amountKWR-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.amountKWR || 0}
                onChange={e => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "amountKWR", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "rateTHB",
            header: 'Rate THB',
            cell: (row) => <InputCustom
                size="xs"
                key={`booking-rateTHB-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.rateTHB || 0}
                onChange={e => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "rateTHB", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "amountTHB",
            header: 'Amount THB',
            cell: (row) => <InputCustom
                size="sm"
                key={`booking-amountTHB-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.amountTHB || 0}
                onChange={e => handleBookingItemChange((row.row.original as any).__originalIndex ?? row.row.index, "amountTHB", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: (row) => (
                <button
                    type="button"
                    onClick={() => deleteBookingItem(row.row.original.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash className="w-4 h-4" />
                </button>
            )
        }
    ], [bookingItems.length, invoiceId, isNew]);

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
                key={`simple-desc-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.description || ""}
                onChange={e => handleSimpleItemChange((row.row.original as any).__originalIndex ?? row.row.index, "description", e.target.value)}
            />
        },
        {
            accessorKey: "amountKWR",
            header: 'Amount KWR',
            cell: (row) => <InputCustom
                size="sm"
                key={`simple-amountKWR-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.amountKWR || 0}
                onChange={e => handleSimpleItemChange((row.row.original as any).__originalIndex ?? row.row.index, "amountKWR", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "amountTHB",
            header: 'Amount THB',
            cell: (row) => <InputCustom
                size="sm"
                key={`simple-amountTHB-${row.row.original.id}-${(row.row.original as any).__originalIndex ?? row.row.index}`}
                value={row.row.original.amountTHB || 0}
                onChange={e => handleSimpleItemChange((row.row.original as any).__originalIndex ?? row.row.index, "amountTHB", isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
            />
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: (row) => (
                <button
                    type="button"
                    onClick={() => deleteSimpleItem(row.row.original.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash className="w-4 h-4" />
                </button>
            )
        }
    ], [simpleItems.length, invoiceId, isNew]);

    return (
        <>
            <Loader isLoading={loading || isSaving} />
            <Dialog open={isOpen} onOpenChange={onOpenChanged}>
                <DialogContent className="max-w-6xl max-h-[90vh] min-w-[95vw] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isNew ? 'Create New Invoice' : 'Edit Invoice'}</DialogTitle>
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
                                        <label className="text-sm font-medium">Booking Source</label>
                                        <InputCustom
                                            size="md"
                                            value={invoice.bookingSource || ""}
                                            onChange={(e) => handleInputChange("bookingSource", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Booking Person</label>
                                        <InputCustom
                                            size="md"
                                            value={invoice.bookingPerson || ""}
                                            onChange={(e) => handleInputChange("bookingPerson", e.target.value)}
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

                            {/* Simple Items Section */}
                            <div className="border-b pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Other Items</h3>
                                    <ButtonCustom
                                        type="button"
                                        variant="green"
                                        size="sm"
                                        onClick={addSimpleItem}
                                    >
                                        Add New Row
                                    </ButtonCustom>
                                </div>
                                {visibleSimpleItems.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <BillDataTable columns={simpleItemsColumns} data={visibleSimpleItems} />
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">No simple items added yet</div>
                                )}
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
                                {visibleBookingItems.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <BillDataTable columns={bookingItemsColumns} data={visibleBookingItems} />
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">No booking items added yet</div>
                                )}
                            </div>

                            {/* Amount Fields Section */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-4">Amount Details</h3>
                                <div className="flex flex-wrap gap-4">
                                    {/* KWR Section */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Total Amount (KWR)</label>
                                        <InputCustom
                                            size="md"
                                            value={invoice.totalAmountKWR || 0}
                                            onChange={e => handleInputChange("totalAmountKWR", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Deposit (KWR)</label>
                                        <InputCustom
                                            size="md"
                                            value={invoice.depositKWR || 0}
                                            onChange={e => handleInputChange("depositKWR", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Due Amount (KWR)</label>
                                        <InputCustom
                                            size="md"
                                            value={invoice.dueAmountKWR || 0}
                                            onChange={e => handleInputChange("dueAmountKWR", e.target.value)}
                                        />
                                    </div>

                                    {/* THB Section */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Total Amount (THB)</label>
                                        <InputCustom
                                            size="md"
                                            value={invoice.totalAmountTHB || 0}
                                            onChange={e => handleInputChange("totalAmountTHB", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Deposit (THB)</label>
                                        <InputCustom
                                            size="md"
                                            value={invoice.depositTHB || 0}
                                            onChange={e => handleInputChange("depositTHB", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Due Amount (THB)</label>
                                        <InputCustom
                                            size="md"
                                            value={invoice.dueAmountTHB || 0}
                                            onChange={e => handleInputChange("dueAmountTHB", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row gap-2">
                                <div className="flex flex-col flex-1 gap-2">
                                    <label className="text-sm font-medium">Included Items</label>
                                    <Textarea
                                        value={invoice.included || ""}
                                        onChange={(e) => handleInputChange("included", e.target.value)}
                                        placeholder="Enter included items..."
                                        className="min-h-[80px] max-h-[80px]"
                                    />
                                </div>
                                <div className="flex flex-col flex-1 gap-2">
                                    <label className="text-sm font-medium">Not Included Items</label>
                                    <Textarea
                                        value={invoice.notIncluded || ""}
                                        onChange={(e) => handleInputChange("notIncluded", e.target.value)}
                                        placeholder="Enter not included items..."
                                        className="min-h-[80px] max-h-[80px]"
                                    />
                                </div>

                                <div className="flex flex-col flex-1 gap-2">
                                    <label className="text-sm font-medium">Note</label>
                                    <Textarea
                                        value={invoice.note || ""}
                                        onChange={(e) => handleInputChange("note", e.target.value)}
                                        placeholder="Enter invoice note..."
                                        className="min-h-[80px] max-h-[80px]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <ButtonCustom variant="ghost" size="default">
                                Cancel
                            </ButtonCustom>
                        </DialogClose>
                        <ButtonCustom variant="gray" size="default" onClick={() => handlePrintInvoice()}>
                            Print Invoice
                        </ButtonCustom>
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
        </>
    );
}