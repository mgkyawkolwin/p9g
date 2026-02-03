import EntityBase from "@/lib/models/entity/EntityBase";

export default class SimpleInvoiceItemEntity extends EntityBase {
    public invoiceId: string = '';
    public description: string = '';
    public location: string = '';
    public amount: number = 0;
    public currency: string = 'KWR';
}
