import DomainBase from "@/lib/models/domain/DomainBase";
import SimpleInvoiceItem from "./SimpleInvoiceItem";
import BookingInvoiceItem from "./BookingInvoiceItem";

export default class Invoice extends DomainBase {
    public agentName: string = '';
    public invoiceNumber: string = '';
    public invoiceDate: Date = null;
    public customerName: string = '';
    public pax: string = '';
    public depositKWR: number = 0;
    public totalAmountKWR: number = 0;
    public dueAmountKWR: number = 0;
    public depositTHB: number = 0;
    public totalAmountTHB: number = 0;
    public dueAmountTHB: number = 0;
    public status: string = 'DRAFT';
    public included: string = '';
    public notIncluded: string = '';
    public simpleItems: SimpleInvoiceItem[] = [];
    public bookingItems: BookingInvoiceItem[] = [];
}
