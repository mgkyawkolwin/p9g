import DomainBase from "@/lib/models/domain/DomainBase";


export default class PrepaidPackage extends DomainBase {
    public balance: number = 0;
    public customerEnglishName: string = '';
    public customerId: string = '';
    public customerName: string = '';
    public deposit: number = 0;
    public depositDateTimeUTC: Date = null;
    public effectiveEndDate: Date = null;
    public effectiveStartDate: Date = null;
    public location: string = '';
    public noOfDays: number = 0;
    public prepaidPackageTypeId: string = '';
    public prepaidPackageTypeText: string = '';
    public price: number = 0;
    public remark: string = '';
}