import IInvoiceService from "./contracts/IInvoiceService";
import { inject, injectable } from "inversify";
import type IRepository from "@/lib/repositories/IRepository";
import { PagerParams, TYPES } from "@/core/types";
import Invoice from "@/core/models/domain/Invoice";
import SimpleInvoiceItem from "@/core/models/domain/SimpleInvoiceItem";
import BookingInvoiceItem from "@/core/models/domain/BookingInvoiceItem";
import c from "@/lib/loggers/console/ConsoleLogger";
import { CustomError } from "@/lib/errors";
import SessionUser from "@/core/models/dto/SessionUser";

@injectable()
export default class InvoiceService implements IInvoiceService {

    constructor(
        @inject(TYPES.IInvoiceRepository) private invoiceRepository: IRepository<Invoice>,
        @inject(TYPES.ISimpleInvoiceItemRepository) private simpleInvoiceItemRepository: IRepository<SimpleInvoiceItem>,
        @inject(TYPES.IBookingInvoiceItemRepository) private bookingInvoiceItemRepository: IRepository<BookingInvoiceItem>
    ) {
    }

    async invoiceCreate(invoice: Invoice, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('InvoiceService > invoiceCreate');
        
        if (!invoice) throw new CustomError('Service: Invoice is required.');
        if (!invoice.invoiceNumber) throw new CustomError('Service: Invoice number is required.');
        if (!invoice.customerName) throw new CustomError('Service: Customer name is required.');

        invoice.createdAtUTC = new Date();
        invoice.createdBy = sessionUser.id;
        invoice.updatedAtUTC = new Date();
        invoice.updatedBy = sessionUser.id;

        const createdInvoice = await this.invoiceRepository.create(invoice);
        
        // Create invoice items
        if (invoice.simpleItems && invoice.simpleItems.length > 0) {
            for (const item of invoice.simpleItems) {
                item.createdAtUTC = new Date();
                item.createdBy = sessionUser.id;
                item.updatedAtUTC = new Date();
                item.updatedBy = sessionUser.id;
                await this.simpleInvoiceItemRepository.create(item);
            }
        }

        if (invoice.bookingItems && invoice.bookingItems.length > 0) {
            for (const item of invoice.bookingItems) {
                item.createdAtUTC = new Date();
                item.createdBy = sessionUser.id;
                item.updatedAtUTC = new Date();
                item.updatedBy = sessionUser.id;
                await this.bookingInvoiceItemRepository.create(item);
            }
        }

        c.fe('InvoiceService > invoiceCreate');
        return createdInvoice;
    }

    async invoiceGetById(id: string, sessionUser: SessionUser): Promise<Invoice | null> {
        c.fs('InvoiceService > invoiceGetById');
        
        if (!id) throw new CustomError('Service: Invoice id is required.');

        const invoice = await this.invoiceRepository.findById(id);
        c.fe('InvoiceService > invoiceGetById');
        return invoice;
    }

    async invoiceGetList(searchParams: Record<string, any>, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Invoice[], number]> {
        c.fs('InvoiceService > invoiceGetList');
        
        // You can add search logic here if needed
        const [invoices, count] = await this.invoiceRepository.findMany();
        
        c.fe('InvoiceService > invoiceGetList');
        return [invoices, count];
    }

    async invoiceUpdate(id: string, invoice: Invoice, sessionUser: SessionUser): Promise<void> {
        c.fs('InvoiceService > invoiceUpdate');
        
        if (!id) throw new CustomError('Service: Invoice id is required.');
        if (!invoice) throw new CustomError('Service: Invoice is required.');

        invoice.updatedAtUTC = new Date();
        invoice.updatedBy = sessionUser.id;

        await this.invoiceRepository.update(id, invoice);
        c.fe('InvoiceService > invoiceUpdate');
    }

    async invoicePatch(id: string, invoice: Invoice, sessionUser: SessionUser): Promise<void> {
        c.fs('InvoiceService > invoicePatch');
        
        if (!id) throw new CustomError('Service: Invoice id is required.');
        if (!invoice) throw new CustomError('Service: Invoice is required.');

        const existingInvoice = await this.invoiceRepository.findById(id);
        if (!existingInvoice) throw new CustomError('Service: Invoice not found.');

        // Merge partial updates
        Object.assign(existingInvoice, invoice);
        existingInvoice.updatedAtUTC = new Date();
        existingInvoice.updatedBy = sessionUser.id;

        await this.invoiceRepository.update(id, existingInvoice);
        c.fe('InvoiceService > invoicePatch');
    }

    async invoiceDelete(id: string, sessionUser: SessionUser): Promise<void> {
        c.fs('InvoiceService > invoiceDelete');
        
        if (!id) throw new CustomError('Service: Invoice id is required.');

        await this.invoiceRepository.delete(id);
        c.fe('InvoiceService > invoiceDelete');
    }
}
