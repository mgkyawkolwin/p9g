import EntityBase from "../../../lib/models/entity/EntityBase";

export default class PrepaidCodeRenewHistoryEntity extends EntityBase{
    public reservationId: string = '';
    public prepaidCodeId: string = '';
    public totalDays: number = 0;
    public usedDays: number = 0;
    public balanceDays: number = 0;
    public startDate: Date = null;
    public endDate: Date = null;

}