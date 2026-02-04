import EntityBase from "@/lib/models/entity/EntityBase";

export default class InvoiceEntity extends EntityBase {
    public agentName: string = '';
    public invoiceNumber: string = '';
    public invoiceDate: Date = null;
    public customerName: string = '';
    public depositKWR: number = 0;
    public totalAmountKWR: number = 0;
    public dueAmountKWR: number = 0;
    public depositTHB: number = 0;
    public totalAmountTHB: number = 0
    public dueAmountTHB: number = 0;
    public status: string = 'DRAFT';
    public paymentDueDate: Date = null;
    public included: string = '';
    public notIncluded: string = '';
    public note: string = '';
    public pax: string = '';
}
