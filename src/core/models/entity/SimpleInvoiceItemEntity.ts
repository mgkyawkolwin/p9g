import EntityBase from "@/lib/models/entity/EntityBase";

export default class SimpleInvoiceItemEntity extends EntityBase {
    public invoiceId: string = '';
    public description: string = '';
    public amountKWR: number = 0;
    public amountTHB: number = 0;
    public createdAtUTC: Date;
    public updatedAtUTC: Date;
}
