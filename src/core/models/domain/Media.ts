import DomainBase from "@/lib/models/domain/DomainBase";

export default class Media extends DomainBase{
    public reservationId: string | null = null;
    public customerId: string = "";
    public mediaGroupId: string = "";
    public url: string = "";
}