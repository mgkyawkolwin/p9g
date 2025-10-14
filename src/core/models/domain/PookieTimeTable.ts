import DomainBase from "@/lib/models/domain/DomainBase";

export default class PookieTimeTable extends DomainBase{
    public date: Date = new Date();
    public hole: string = '';
    public isBusy: boolean = false;
    public rooms: string = '';
    public time: Date = null;
}