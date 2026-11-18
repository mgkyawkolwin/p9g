import EntityBase from "../../../lib/models/entity/EntityBase";

export default class TaskEntity extends EntityBase{
    public reservationId: string | null = null;
    public customerId: string | null = null;
    public description: string = "";
    public department: string | null = null;
    public status: string = "";
    public remark: string | null = null;
    public targetCompletionDateTime: Date | null = null;
}
