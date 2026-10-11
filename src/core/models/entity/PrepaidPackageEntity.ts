import EntityBase from "../../../lib/models/entity/EntityBase";


export default class PrepaidPackageEntity extends EntityBase {
    public balance: number = 0;
    public customerId: string = '';
    public deposit: number = 0;
    public depositDateTimeUTC: Date = null;
    public effectiveEndDate: Date = null;
    public effectiveStartDate: Date = null;
    public location: string = '';
    public noOfDays: number = 0;
    public prepaidPackageTypeId: string = '';
    public price: number = 0;
    public remark: string = '';
}