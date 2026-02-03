import DomainBase from "@/lib/models/domain/DomainBase";
import SimpleInvoiceItem from "./SimpleInvoiceItem";
import BookingInvoiceItem from "./BookingInvoiceItem";

export default class Invoice extends DomainBase {
    public invoiceNumber: string = '';
    public invoiceDate: Date = null;
    public customerName: string = '';
    public deposit: number = 0;
    public totalAmount: number = 0;
    public taxAmount: number = 0;
    public discountAmount: number = 0;
    public netAmount: number = 0;
    public paidAmount: number = 0;
    public dueAmount: number = 0;
    public currency: string = 'KWR';
    public status: string = 'DRAFT';
    public paymentDueDate: Date = null;
    public notes: string = '';
    public simpleItems: SimpleInvoiceItem[] = [];
    public bookingItems: BookingInvoiceItem[] = [];
}
