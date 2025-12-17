import DomainBase from "@/lib/models/domain/DomainBase";

export default class Feedback extends DomainBase{
    public reservationId: string = '';
    public customerId: string = "";
    public feedback: string = "";
}