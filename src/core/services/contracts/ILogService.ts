
import type { PagerParams, SearchFormFields } from '@/core/types';

export default interface ILogService {
    logError(error:any) : Promise<void>;
    reservationLogGetList(searchData: SearchFormFields, pager: PagerParams, location: string): Promise<{ logs: any[]; pager: PagerParams }>;
    roomChargeLogGetList(searchData: SearchFormFields, pager: PagerParams, location: string): Promise<{ logs: any[]; pager: PagerParams }>;
}