import { PagerParams, SearchFormFields } from "@/core/types";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";
import SessionUser from "../../models/dto/SessionUser";
import PrepaidEntity from "@/core/models/entity/PrepaidEntity";
import PrepaidPackagePayment from "@/core/models/domain/PrepaidPackagePayment";

export interface PrepaidPackageUsageHistory {
    reservationId: string;
    customerEnglishName: string;
    customerName: string | null;
    startDate: Date;
    endDate: Date;
    days: number;
}

export interface PrepaidPackageCustomerSummary {
    customerId: string;
    name: string;
    englishName: string;
    totalDaysUsed: number;
}


export default interface IPrepaidPackageService {
    prepaidPackageCreate(prepaidPackage: PrepaidPackage, sessionUser: SessionUser): Promise<PrepaidPackage>;
    prepaidPackageUpdate(id: string, prepaidPackage: PrepaidPackage, sessionUser: SessionUser): Promise<PrepaidPackage>;
    prepaidPackageFindMany(pagerParams: PagerParams, sessionUser: SessionUser, searchFormFields?: SearchFormFields): Promise<[PrepaidPackage[], number]>;
    prepaidPackageUsageFindMany(id: string, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[PrepaidPackageUsageHistory[], number]>;
    prepaidPackageCustomerSummaryFindMany(id: string, sessionUser: SessionUser): Promise<PrepaidPackageCustomerSummary[]>;
    prepaidPackagePaymentFindMany(id: string, sessionUser: SessionUser): Promise<PrepaidPackagePayment[]>;
    prepaidPackagePaymentCreate(id: string, payment: PrepaidPackagePayment, sessionUser: SessionUser): Promise<PrepaidPackagePayment>;
    prepaidPackagePaymentUpdate(id: string, paymentId: string, payment: PrepaidPackagePayment, sessionUser: SessionUser): Promise<PrepaidPackagePayment>;
    prepaidPackagePaymentDelete(id: string, paymentId: string, sessionUser: SessionUser): Promise<void>;
    prepaidPackageTypeFindMany(sessionUser: SessionUser): Promise<PrepaidEntity[]>;
}