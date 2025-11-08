import DomainBase from "@/lib/models/domain/DomainBase";

export default class PookieTimeTable extends DomainBase{
    public date: Date = new Date();
    public hole: string = '';
    public isBusy: boolean = false;
    public location: string = '';
    public noOfPeople: number = 0;
    public rooms: string = '';
    public time: Date = null;
}