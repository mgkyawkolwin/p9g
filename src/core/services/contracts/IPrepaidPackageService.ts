import { PagerParams } from "@/core/types";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";
import SessionUser from "../../models/dto/SessionUser";
import Config from "@/core/models/domain/Config";


export default interface IPrepaidPackageService {
    prepaidPackageCreate(prepaidPackage: PrepaidPackage, sessionUser: SessionUser): Promise<PrepaidPackage>;
    prepaidPackageFindMany(pagerParams: PagerParams, sessionUser: SessionUser): Promise<[PrepaidPackage[], number]>;
    prepaidPackageTypeFindMany(sessionUser: SessionUser): Promise<Config[]>;
}