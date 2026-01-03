import DomainBase from "@/lib/models/domain/DomainBase";

export default class Media extends DomainBase{
    public reservationId: string = '';
    public customerId: string = "";
    public url: string = "";
}