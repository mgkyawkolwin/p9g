import DomainBase from "@/lib/models/domain/DomainBase";

export default class Config extends DomainBase {
    public group: string = '';
    public value: string = '';
    public text: string = '';
}