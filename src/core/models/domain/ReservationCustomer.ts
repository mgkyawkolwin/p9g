import DomainBase from "@/lib/models/domain/DomainBase";

export default class ReservationCustomer extends DomainBase{
    public reservationId: string = '';
    public customerId: string = '';
    public tdacStatusId: string = '';
    public baggageTransfer: string | null = null;
    public visaRequired: boolean = false;
}