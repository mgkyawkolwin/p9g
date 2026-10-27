import EntityBase from "../../../lib/models/entity/EntityBase";


export default class PrepaidPackageEntity extends EntityBase {
    public balance: number = 0;
    public customerId: string = '';
    public daysUsed: number = 0;
    public effectiveEndDate: Date = null;
    public effectiveStartDate: Date = null;
    public location: string = '';
    public noOfDays: number = 0;
    public packageStatus: 'New' | 'In Use' | 'Finished' = 'New';
    public paymentStatus: 'Paid' | 'Unpaid' = 'Unpaid';
    public prepaidPackageTypeId: string = '';
    public price: number = 0;
    public remark: string = '';
}