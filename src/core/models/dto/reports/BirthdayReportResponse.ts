import BirthdayReportRow from "./BirthdayReportRow";
import { PagerParams } from "@/core/types";

export default interface BirthdayReportResponse {
    birthdays: BirthdayReportRow[];
    pager: PagerParams;
}
