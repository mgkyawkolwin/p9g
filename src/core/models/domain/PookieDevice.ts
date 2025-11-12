import DomainBase from "@/lib/models/domain/DomainBase";

export default class PookieDevice extends DomainBase{
    public deviceId: string = '';
    public isBlocked: boolean = false;
    public lastRequestAtUTC: Date = null;
}