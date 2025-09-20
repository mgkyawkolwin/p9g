import EntityBase from "../../../lib/models/entity/EntityBase";

export default class PromotionEntity extends EntityBase{
    value: string = '';
    text: string = '';
    days: number = 0;
}