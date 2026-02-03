import DomainBase from "@/lib/models/domain/DomainBase";

export default class SimpleInvoiceItem extends DomainBase {
    public description: string = '';
    public amountKWR: number = 0;
    public amountTHB: number = 0;
}
