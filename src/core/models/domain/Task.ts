import DomainBase from "@/lib/models/domain/DomainBase";

export default class Task extends DomainBase{
    public reservationId: string | null = null;
    public customerId: string | null = null;
    public description: string = "";
    public department: string | null = null;
    public status: string = "";
    public remark: string | null = null;
    public targetCompletionDateTime: Date | null = null;
}
