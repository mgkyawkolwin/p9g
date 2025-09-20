import DomainBase from "@/lib/models/domain/DomainBase";

export default class ReservationCustomer extends DomainBase{
    public reservationId: string = '';
    public customerId: string = '';
}