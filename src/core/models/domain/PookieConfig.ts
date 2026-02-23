import DomainBase from "@/lib/models/domain/DomainBase";

export default class PookieConfig extends DomainBase{
    public contactUrl: string = '';
    public key: string = '';
    public seeResultUntil: number = 0;
    public version: string = '';
}