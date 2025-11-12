import DomainBase from "@/lib/models/domain/DomainBase";

export default class PookieConfig extends DomainBase{
    public key: string = '';
    public version: string = '';
}