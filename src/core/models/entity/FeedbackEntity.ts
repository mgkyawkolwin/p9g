import EntityBase from "../../../lib/models/entity/EntityBase";

export default class FeedbackEntity extends EntityBase{
    public reservationId: string = '';
    public customerId: string = "";
    public feedback: string = "";
}