import DomainBase from "@/lib/models/domain/DomainBase";


export default class PrepaidPackage extends DomainBase {
    public balance: number = 0;
    public customerEnglishName: string = '';
    public customerId: string = '';
    public customerName: string = '';
    public daysUsed: number = 0;
    public effectiveEndDate: Date = null;
    public effectiveStartDate: Date = null;
    public location: string = '';
    public noOfDays: number = 0;
    public paidAmount: number = 0;
    public packageStatus: 'New' | 'In Use' | 'Finished' = 'New';
    public paymentStatus: 'Paid' | 'Unpaid' = 'Unpaid';
    public prepaidPackageTypeId: string = '';
    public prepaidPackageTypeText: string = '';
    public price: number = 0;
    public remark: string = '';
}