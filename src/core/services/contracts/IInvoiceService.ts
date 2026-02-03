import { PagerParams, SearchParam } from "@/core/types";
import Invoice from "@/core/models/domain/Invoice";
import SessionUser from "../../models/dto/SessionUser";

export default interface IInvoiceService {
    invoiceCreate(invoice: Invoice, sessionUser: SessionUser): Promise<Invoice>;
    invoiceGetById(id: string, sessionUser: SessionUser): Promise<Invoice | null>;
    invoiceGetList(searchParams: Record<string, any>, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Invoice[], number]>;
    invoiceUpdate(id: string, invoice: Invoice, sessionUser: SessionUser): Promise<void>;
    invoicePatch(id: string, invoice: Invoice, sessionUser: SessionUser): Promise<void>;
    invoiceDelete(id: string, sessionUser: SessionUser): Promise<void>;
}
