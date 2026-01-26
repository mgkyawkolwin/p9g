import DomainBase from "@/lib/models/domain/DomainBase";
import Feedback from "./Feedback";
import Media from "./Media";

export default class Customer extends DomainBase {
    public address: string = '';
    public remarks: string = '';
    public country: string = '';
    public dob: string = '';
    public email: string = '';
    public englishName: string = '';
    public feedback: Feedback = null;
    public gender: string = 'Unknown';
    public medias: Media[] = [];
    public name: string = '';
    public nationalId: string = '';
    public passport: string = '';
    public phone: string = '';
    public tdacFileUrl: string = '';
}