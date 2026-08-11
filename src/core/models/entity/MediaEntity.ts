import EntityBase from "../../../lib/models/entity/EntityBase";

export default class MediaEntity extends EntityBase{
    public reservationId: string = '';
    public customerId: string = "";
    public mediaGroupId: string = "";
    public url: string = "";
}