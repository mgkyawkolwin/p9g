import IInvoiceService from "./contracts/IInvoiceService";
import { inject, injectable } from "inversify";
import type IRepository from "@/lib/repositories/IRepository";
import { PagerParams, SearchFormFields, TYPES } from "@/core/types";
import Invoice from "@/core/models/domain/Invoice";
import SimpleInvoiceItem from "@/core/models/domain/SimpleInvoiceItem";
import BookingInvoiceItem from "@/core/models/domain/BookingInvoiceItem";
import c from "@/lib/loggers/console/ConsoleLogger";
import { CustomError } from "@/lib/errors";
import SessionUser from "@/core/models/dto/SessionUser";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import { TransactionType } from "@/core/db/mysql/MySqlDatabase";
import { asc, desc, eq } from "@/lib/transformers/types";
import {v4 as uuidv4} from 'uuid';
import { buildAnyCondition } from "../helpers";
import { any } from "zod";

@injectable()
export default class InvoiceService implements IInvoiceService {

    constructor(
        @inject(TYPES.IInvoiceRepository) private invoiceRepository: IRepository<Invoice>,
        @inject(TYPES.ISimpleInvoiceItemRepository) private simpleInvoiceItemRepository: IRepository<SimpleInvoiceItem>,
        @inject(TYPES.IBookingInvoiceItemRepository) private bookingInvoiceItemRepository: IRepository<BookingInvoiceItem>,
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>
    ) {
    }

    async invoiceCreate(invoice: Invoice, sessionUser: SessionUser): Promise<Invoice> {
        c.fs('InvoiceService > invoiceCreate');

        if (!invoice) throw new CustomError('Service: Invoice is required.');
        if (!invoice.invoiceNumber) throw new CustomError('Service: Invoice number is required.');
        if (!invoice.customerName) throw new CustomError('Service: Customer name is required.');

        // invoice.id = uuidv4();
        invoice.createdAtUTC = new Date();
        invoice.createdBy = sessionUser.id;
        invoice.updatedAtUTC = new Date();
        invoice.updatedBy = sessionUser.id;

        let createdInvoice: Invoice = null as any;

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            createdInvoice = await this.invoiceRepository.create(invoice, tx as any);

            // Create invoice simple items (use bulk create when possible)
            if (invoice.simpleItems && invoice.simpleItems.length > 0) {
                const itemsToInsert = invoice.simpleItems.map(item => {
                    if (!item.id) item.id = uuidv4();
                    item.invoiceId = createdInvoice.id;
                    // item.createdAtUTC = new Date(); // front end ui will set createdAtUTC for sorting purposes
                    item.createdBy = sessionUser.id;
                    item.updatedAtUTC = new Date();
                    item.updatedBy = sessionUser.id;
                    return item;
                });

                // use createMany for bulk insert when available
                await this.simpleInvoiceItemRepository.createMany(itemsToInsert as any[], tx as any);
            }

            // Create booking items (use bulk create when possible)
            if (invoice.bookingItems && invoice.bookingItems.length > 0) {
                const itemsToInsert = invoice.bookingItems.map(item => {
                    if (!item.id) item.id = uuidv4();
                    item.invoiceId = createdInvoice.id;
                    // item.createdAtUTC = new Date(); // front end ui will set createdAtUTC for sorting purposes
                    item.createdBy = sessionUser.id;
                    item.updatedAtUTC = new Date();
                    item.updatedBy = sessionUser.id;
                    return item;
                });

                await this.bookingInvoiceItemRepository.createMany(itemsToInsert as any[], tx as any);
            }
        });

        c.fe('InvoiceService > invoiceCreate');
        return createdInvoice;
    }

    async invoiceGetById(id: string, sessionUser: SessionUser): Promise<Invoice | null> {
        c.fs('InvoiceService > invoiceGetById');

        if (!id) throw new CustomError('Service: Invoice id is required.');

        const invoice = await this.invoiceRepository.findById(id);
        if (!invoice) {
            c.fe('InvoiceService > invoiceGetById');
            return null;
        }

        // load related items
        const [simpleItems] = await this.simpleInvoiceItemRepository.findMany(eq("invoiceId", id), asc("createdAtUTC"));
        const [bookingItems] = await this.bookingInvoiceItemRepository.findMany(eq("invoiceId", id), asc("createdAtUTC"));

        invoice.simpleItems = simpleItems || [];
        invoice.bookingItems = bookingItems || [];

        c.fe('InvoiceService > invoiceGetById');
        return invoice;
    }

    async invoiceGetList(searchFormFields: SearchFormFields, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[Invoice[], number]> {
        c.fs('InvoiceService > invoiceGetList');

        const anyCondition = buildAnyCondition(searchFormFields);
        
        const [invoices, count] = await this.invoiceRepository.findMany(anyCondition, desc("createdAtUTC"), (pagerParams.pageIndex - 1) * pagerParams.pageSize, pagerParams.pageSize);
        
        c.fe('InvoiceService > invoiceGetList');
        return [invoices, count];
    }

    async invoiceUpdate(id: string, invoice: Invoice, sessionUser: SessionUser): Promise<void> {
        c.fs('InvoiceService > invoiceUpdate');

        if (!id) throw new CustomError('Service: Invoice id is required.');
        if (!invoice) throw new CustomError('Service: Invoice is required.');

        invoice.updatedAtUTC = new Date();
        invoice.updatedBy = sessionUser.id;

        // prepare item lists
        const simpleUpdateList = (invoice.simpleItems || []).filter(i => i.modelState === 'updated');
        const simpleInsertList = (invoice.simpleItems || []).filter(i => i.modelState === 'inserted');
        const simpleDeleteList = (invoice.simpleItems || []).filter(i => i.modelState === 'deleted');

        const bookingUpdateList = (invoice.bookingItems || []).filter(i => i.modelState === 'updated');
        const bookingInsertList = (invoice.bookingItems || []).filter(i => i.modelState === 'inserted');
        const bookingDeleteList = (invoice.bookingItems || []).filter(i => i.modelState === 'deleted');

        // If client provided full arrays (PUT/complete update), detect items removed by the client
        // and treat them as deleted to handle UIs that remove rows instead of marking them deleted.
        const existingSimpleItems = (await this.simpleInvoiceItemRepository.findMany(eq("invoiceId", id)))[0] || [];
        const existingBookingItems = (await this.bookingInvoiceItemRepository.findMany(eq("invoiceId", id)))[0] || [];

        if (invoice.simpleItems && invoice.simpleItems.length > 0) {
            const incomingSimpleIds = invoice.simpleItems.filter(i => i.id).map(i => i.id);
            const implicitlyDeleted = existingSimpleItems.filter(e => !incomingSimpleIds.includes(e.id)).map(e => ({ ...e, modelState: 'deleted' }));
            // merge implicit deletes into simpleDeleteList
            if (implicitlyDeleted.length > 0) {
                simpleDeleteList.push(...implicitlyDeleted as any);
            }
        }

        if (invoice.bookingItems && invoice.bookingItems.length > 0) {
            const incomingBookingIds = invoice.bookingItems.filter(i => i.id).map(i => i.id);
            const implicitlyDeleted = existingBookingItems.filter(e => !incomingBookingIds.includes(e.id)).map(e => ({ ...e, modelState: 'deleted' }));
            if (implicitlyDeleted.length > 0) {
                bookingDeleteList.push(...implicitlyDeleted as any);
            }
        }

        // set timestamps and ensure ids for insert lists
        simpleUpdateList.forEach(i => { i.updatedAtUTC = new Date(); i.updatedBy = sessionUser.id; });
        simpleInsertList.forEach(i => { if (!i.id) i.id = uuidv4(); i.createdAtUTC = new Date(); i.createdBy = sessionUser.id; i.updatedAtUTC = new Date(); i.updatedBy = sessionUser.id; i.invoiceId = id; });
        bookingUpdateList.forEach(i => { i.updatedAtUTC = new Date(); i.updatedBy = sessionUser.id; });
        bookingInsertList.forEach(i => { if (!i.id) i.id = uuidv4(); i.createdAtUTC = new Date(); i.createdBy = sessionUser.id; i.updatedAtUTC = new Date(); i.updatedBy = sessionUser.id; i.invoiceId = id; });

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            // update invoice
            await this.invoiceRepository.update(id, invoice, tx as any);

            // delete items
            for (const item of simpleDeleteList) {
                await this.simpleInvoiceItemRepository.delete(item.id, tx as any);
            }
            for (const item of bookingDeleteList) {
                await this.bookingInvoiceItemRepository.delete(item.id, tx as any);
            }

            // update items
            for (const item of simpleUpdateList) {
                await this.simpleInvoiceItemRepository.update(item.id, item, tx as any);
            }
            for (const item of bookingUpdateList) {
                await this.bookingInvoiceItemRepository.update(item.id, item, tx as any);
            }

            // insert items (use bulk create)
            if (simpleInsertList.length > 0) {
                await this.simpleInvoiceItemRepository.createMany(simpleInsertList as any[], tx as any);
            }
            if (bookingInsertList.length > 0) {
                await this.bookingInvoiceItemRepository.createMany(bookingInsertList as any[], tx as any);
            }
        });

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

        await this.dbClient.db.transaction(async (tx: TransactionType) => {
            // delete items first (defensive) then invoice
            await this.simpleInvoiceItemRepository.deleteWhere(eq("invoiceId", id), tx as any);
            await this.bookingInvoiceItemRepository.deleteWhere(eq("invoiceId", id), tx as any);
            await this.invoiceRepository.delete(id, tx as any);
        });

        c.fe('InvoiceService > invoiceDelete');
    }
}
