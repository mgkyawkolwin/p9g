import EntityBase from "../../../lib/models/entity/EntityBase";

export default class PrepaidCodeEntity extends EntityBase{
    public customerId: string = '';
    public prepaidCode: string = '';
    public totalDays: number = 0;
    public usedDays: number = 0;
    public balanceDays: number = 0;
    public startDate: Date = null;
    public endDate: Date = null;
    public renewDate: Date = null;

}