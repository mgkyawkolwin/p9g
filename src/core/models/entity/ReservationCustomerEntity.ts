import EntityBase from "../../../lib/models/entity/EntityBase";

export default class ReservationCustomerEntity extends EntityBase{
    public reservationId: string = '';
    public customerId: string = '';
    public tdacStatusId: string = '';
    public baggageTransfer: string | null = null;
    public visaRequired: boolean = false;
}