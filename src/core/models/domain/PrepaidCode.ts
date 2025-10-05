import DomainBase from "@/lib/models/domain/DomainBase";

export default class PrepaidCode extends DomainBase{
    public customerId: string = '';
    public prepaidCode: string = '';
    public totalDays: number = 0;
    public usedDays: number = 0;
    public balanceDays: number = 0;
    public startDate: Date = null;
    public endDate: Date = null;
    public renewDate: Date = null;
}