import { injectable, inject } from 'inversify';

import c from '@/lib/loggers/console/ConsoleLogger';
import { PagerParams, SearchFormFields, TYPES } from '@/core/types';
import SessionUser from '../models/dto/SessionUser';
import type IRepository from '@/lib/repositories/IRepository';
import PrepaidPackage from '../models/domain/PrepaidPackage';
import type IPrepaidPackageService from './contracts/IPrepaidPackageService';
import { and, asc, desc, eq, gte, inList, like, lte, type AnyCondition } from '@/lib/transformers/types';
import { CustomError } from '@/lib/errors';
import Customer from '../models/domain/Customer';
import PrepaidEntity from '../models/entity/PrepaidEntity';
import { HttpStatusCode } from '@/core/constants';
import type { IDatabaseClient } from '@/lib/db/IDatabase';
import PrepaidPackagePayment from '../models/domain/PrepaidPackagePayment';
import { customerTable, packagePaymentTable, packageUsageTable, prepaidPackageTable } from '@/core/orms/drizzle/mysql/schema';
import { and as drizzleAnd, count as drizzleCount, desc as drizzleDesc, eq as drizzleEq, inArray as drizzleInArray, sum as drizzleSum } from 'drizzle-orm';
import type { PrepaidPackageCustomerSummary, PrepaidPackageUsageHistory } from './contracts/IPrepaidPackageService';

const getPackageStatus = (daysUsed: number, noOfDays: number): PrepaidPackage['packageStatus'] =>
    daysUsed === 0 ? 'New' : daysUsed >= noOfDays ? 'Finished' : 'In Use';

const getPaymentStatus = (balance: number): PrepaidPackage['paymentStatus'] =>
    balance === 0 ? 'Paid' : 'Unpaid';


@injectable()
export default class PrepaidPackageService implements IPrepaidPackageService {

    constructor(
        @inject(TYPES.ICustomerRepository) private customerRepository: IRepository<Customer>,
        @inject(TYPES.IPrepaidRepository) private prepaidRepository: IRepository<PrepaidEntity>,
        @inject(TYPES.IPrepaidPackageRepository) private prepaidPackageRepository: IRepository<PrepaidPackage>,
        @inject(TYPES.IDatabase) private readonly dbClient: IDatabaseClient<any>
    ) {

    }


    async prepaidPackageCreate(prepaidPackage: PrepaidPackage, sessionUser: SessionUser): Promise<PrepaidPackage> {
        c.fs('PrepaidPackageService > prepaidPackageCreate');
        c.d(prepaidPackage);

        if (!sessionUser?.id) throw new CustomError('Invalid session user.');
        if (!sessionUser?.location) throw new CustomError('Location is required.');
        if (!prepaidPackage?.customerId) throw new CustomError('Customer is required.');
        if (!prepaidPackage?.prepaidPackageTypeId) throw new CustomError('Prepaid package type is required.');

        const customer = await this.customerRepository.findById(prepaidPackage.customerId);
        if (!customer) throw new CustomError('Customer not found.');

        const packageType = await this.prepaidRepository.findById(prepaidPackage.prepaidPackageTypeId);
        if (!packageType) throw new CustomError('Prepaid package type not found.');

        prepaidPackage.location = sessionUser.location;
        prepaidPackage.paidAmount = 0;
        prepaidPackage.balance = Number(prepaidPackage.price ?? 0) - prepaidPackage.paidAmount;
        prepaidPackage.paymentStatus = getPaymentStatus(prepaidPackage.balance);
        prepaidPackage.packageStatus = getPackageStatus(Number(prepaidPackage.daysUsed ?? 0), Number(prepaidPackage.noOfDays ?? 0));
        prepaidPackage.createdAtUTC = new Date();
        prepaidPackage.createdBy = sessionUser.id;
        prepaidPackage.updatedAtUTC = new Date();
        prepaidPackage.updatedBy = sessionUser.id;

        const created = await this.prepaidPackageRepository.create(prepaidPackage);
        c.fe('PrepaidPackageService > prepaidPackageCreate');
        return created;
    }


    async prepaidPackageUpdate(id: string, prepaidPackage: PrepaidPackage, sessionUser: SessionUser): Promise<PrepaidPackage> {
        c.fs('PrepaidPackageService > prepaidPackageUpdate');
        c.d(prepaidPackage);

        if (!sessionUser?.id) throw new CustomError('Invalid session user.');
        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const existingPackage = await this.prepaidPackageRepository.findById(id);
        if (!existingPackage || existingPackage.location !== sessionUser.location) {
            throw new CustomError('Prepaid package not found.', HttpStatusCode.NotFound);
        }

        if (!prepaidPackage?.customerId) throw new CustomError('Customer is required.');
        if (!prepaidPackage?.prepaidPackageTypeId) throw new CustomError('Prepaid package type is required.');

        const customer = await this.customerRepository.findById(prepaidPackage.customerId);
        if (!customer) throw new CustomError('Customer not found.');

        const packageType = await this.prepaidRepository.findById(prepaidPackage.prepaidPackageTypeId);
        if (!packageType) throw new CustomError('Prepaid package type not found.');

        prepaidPackage.id = id;
        prepaidPackage.location = sessionUser.location;
        const [paymentTotal] = await this.dbClient.db.select({ total: drizzleSum(packagePaymentTable.amount) })
            .from(packagePaymentTable)
            .where(drizzleEq(packagePaymentTable.prepaidPackageId, id));
        prepaidPackage.paidAmount = Number(paymentTotal?.total ?? 0);
        prepaidPackage.balance = Number(prepaidPackage.price ?? 0) - prepaidPackage.paidAmount;
        prepaidPackage.paymentStatus = getPaymentStatus(prepaidPackage.balance);
        prepaidPackage.daysUsed = Number(existingPackage.daysUsed ?? 0);
        prepaidPackage.packageStatus = getPackageStatus(prepaidPackage.daysUsed, Number(prepaidPackage.noOfDays ?? 0));
        prepaidPackage.updatedAtUTC = new Date();
        prepaidPackage.updatedBy = sessionUser.id;

        await this.prepaidPackageRepository.update(id, prepaidPackage);
        c.fe('PrepaidPackageService > prepaidPackageUpdate');
        return prepaidPackage;
    }


    async prepaidPackageFindMany(pagerParams: PagerParams, sessionUser: SessionUser, searchFormFields: SearchFormFields = {}): Promise<[PrepaidPackage[], number]> {
        c.fs('PrepaidPackageService > prepaidPackageFindMany');
        c.d(pagerParams);
        c.d(sessionUser);

        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const pageIndex = pagerParams.pageIndex ?? 1;
        const pageSize = pagerParams.pageSize ?? 10;
        const offset = (pageIndex - 1) * pageSize;

        const conditions: AnyCondition[] = [eq('location', sessionUser.location)];

        if (searchFormFields.searchId) {
            conditions.push(like('id', searchFormFields.searchId));
        }
        if (searchFormFields.searchPrepaidPackageTypeId) {
            conditions.push(eq('prepaidPackageTypeId', searchFormFields.searchPrepaidPackageTypeId));
        }
        if (searchFormFields.searchPaymentStatus) {
            conditions.push(eq('paymentStatus', searchFormFields.searchPaymentStatus));
        }
        if (searchFormFields.searchPackageStatus) {
            conditions.push(eq('packageStatus', searchFormFields.searchPackageStatus));
        }
        if (searchFormFields.searchRemark) {
            conditions.push(like('remark', searchFormFields.searchRemark));
        }
        if (searchFormFields.searchEffectiveFrom) {
            conditions.push(gte('effectiveStartDate', new Date(`${searchFormFields.searchEffectiveFrom}T00:00:00.000Z`)));
        }
        if (searchFormFields.searchEffectiveUntil) {
            conditions.push(lte('effectiveStartDate', new Date(`${searchFormFields.searchEffectiveUntil}T23:59:59.999Z`)));
        }

        const [packages, total] = await this.prepaidPackageRepository.findMany(
            and(...conditions),
            desc('createdAtUTC'),
            offset,
            pageSize
        );

        if (packages.length > 0) {
            const customerIds = Array.from(new Set(packages.map(x => x.customerId).filter(Boolean)));
            const packageTypeIds = Array.from(new Set(packages.map(x => x.prepaidPackageTypeId).filter(Boolean)));

            const [customers] = customerIds.length > 0
                ? await this.customerRepository.findMany(inList('id', customerIds))
                : [[], 0];

            const [packageTypes] = packageTypeIds.length > 0
                ? await this.prepaidRepository.findMany(inList('id', packageTypeIds))
                : [[], 0];

            const paymentTotals = await this.dbClient.db.select({
                prepaidPackageId: packagePaymentTable.prepaidPackageId,
                total: drizzleSum(packagePaymentTable.amount)
            })
                .from(packagePaymentTable)
                .where(drizzleInArray(packagePaymentTable.prepaidPackageId, packages.map(item => item.id)))
                .groupBy(packagePaymentTable.prepaidPackageId);

            const customerMap = new Map(customers.map(x => [x.id, x]));
            const packageTypeMap = new Map(packageTypes.map(x => [x.id, x]));
            const paymentTotalMap = new Map<string, number>();
            paymentTotals.forEach(item => paymentTotalMap.set(item.prepaidPackageId, Number(item.total ?? 0)));

            packages.forEach(item => {
                const customer = customerMap.get(item.customerId);
                const packageType = packageTypeMap.get(item.prepaidPackageTypeId);

                item.paidAmount = paymentTotalMap.get(item.id) ?? 0;
                item.customerName = customer?.name ?? '';
                item.customerEnglishName = customer?.englishName ?? '';
                item.prepaidPackageTypeText = packageType?.text ?? '';
            });
        }

        c.fe('PrepaidPackageService > prepaidPackageFindMany');
        return [packages, total];
    }


    async prepaidPackageTypeFindMany(sessionUser: SessionUser): Promise<PrepaidEntity[]> {
        c.fs('PrepaidPackageService > prepaidPackageTypeFindMany');

        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const [packageTypes] = await this.prepaidRepository.findMany(
            undefined,
            asc('text')
        );

        c.fe('PrepaidPackageService > prepaidPackageTypeFindMany');
        return packageTypes;
    }


    async prepaidPackageUsageFindMany(id: string, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[PrepaidPackageUsageHistory[], number]> {
        c.fs('PrepaidPackageService > prepaidPackageUsageFindMany');

        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const prepaidPackage = await this.prepaidPackageRepository.findById(id);
        if (!prepaidPackage || prepaidPackage.location !== sessionUser.location) {
            throw new CustomError('Prepaid package not found.', HttpStatusCode.NotFound);
        }

        const pageIndex = pagerParams.pageIndex ?? 1;
        const pageSize = pagerParams.pageSize ?? 10;
        const offset = (pageIndex - 1) * pageSize;
        const condition = drizzleEq(packageUsageTable.prepaidPackageId, id);
        const [usages, totalRows] = await Promise.all([
            this.dbClient.db.select({
                reservationId: packageUsageTable.reservationId,
                customerEnglishName: customerTable.englishName,
                customerName: customerTable.name,
                startDate: packageUsageTable.startDate,
                endDate: packageUsageTable.endDate,
                days: packageUsageTable.days,
            })
                .from(packageUsageTable)
                .innerJoin(customerTable, drizzleEq(packageUsageTable.customerId, customerTable.id))
                .where(condition)
                .orderBy(drizzleDesc(packageUsageTable.startDate))
                .limit(pageSize)
                .offset(offset),
            this.dbClient.db.select({ count: drizzleCount() })
                .from(packageUsageTable)
                .where(condition)
        ]);

        c.fe('PrepaidPackageService > prepaidPackageUsageFindMany');
        return [usages, Number(totalRows[0]?.count ?? 0)];
    }


    async prepaidPackageCustomerSummaryFindMany(id: string, sessionUser: SessionUser): Promise<PrepaidPackageCustomerSummary[]> {
        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const prepaidPackage = await this.prepaidPackageRepository.findById(id);
        if (!prepaidPackage || prepaidPackage.location !== sessionUser.location) {
            throw new CustomError('Prepaid package not found.', HttpStatusCode.NotFound);
        }

        const usageTotals = await this.dbClient.db.select({
            customerId: packageUsageTable.customerId,
            name: customerTable.name,
            englishName: customerTable.englishName,
            totalDaysUsed: drizzleSum(packageUsageTable.days)
        })
            .from(packageUsageTable)
            .innerJoin(customerTable, drizzleEq(packageUsageTable.customerId, customerTable.id))
            .where(drizzleEq(packageUsageTable.prepaidPackageId, id))
            .groupBy(packageUsageTable.customerId, customerTable.name, customerTable.englishName);

        return usageTotals.map(item => ({
            customerId: item.customerId,
            name: item.name,
            englishName: item.englishName,
            totalDaysUsed: Number(item.totalDaysUsed ?? 0)
        }));
    }


    async prepaidPackagePaymentFindMany(id: string, sessionUser: SessionUser): Promise<PrepaidPackagePayment[]> {
        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const prepaidPackage = await this.prepaidPackageRepository.findById(id);
        if (!prepaidPackage || prepaidPackage.location !== sessionUser.location) {
            throw new CustomError('Prepaid package not found.', HttpStatusCode.NotFound);
        }

        return this.dbClient.db.select().from(packagePaymentTable)
            .where(drizzleEq(packagePaymentTable.prepaidPackageId, id))
            .orderBy(drizzleDesc(packagePaymentTable.paymentDateTimeUTC));
    }


    async prepaidPackagePaymentCreate(id: string, payment: PrepaidPackagePayment, sessionUser: SessionUser): Promise<PrepaidPackagePayment> {
        if (!sessionUser?.id) throw new CustomError('Invalid session user.');
        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const paymentRecord = Object.assign(new PrepaidPackagePayment(), payment, {
            prepaidPackageId: id,
            createdAtUTC: new Date(),
            createdBy: sessionUser.id,
            updatedAtUTC: new Date(),
            updatedBy: sessionUser.id
        });

        await this.dbClient.db.transaction(async (tx) => {
            const [prepaidPackage] = await tx.select({
                id: prepaidPackageTable.id,
                price: prepaidPackageTable.price,
                daysUsed: prepaidPackageTable.daysUsed,
                noOfDays: prepaidPackageTable.noOfDays
            })
                .from(prepaidPackageTable)
                .where(drizzleAnd(
                    drizzleEq(prepaidPackageTable.id, id),
                    drizzleEq(prepaidPackageTable.location, sessionUser.location!)
                ))
                .for('update');

            if (!prepaidPackage) throw new CustomError('Prepaid package not found.', HttpStatusCode.NotFound);

            await tx.insert(packagePaymentTable).values({
                id: paymentRecord.id,
                prepaidPackageId: id,
                amount: paymentRecord.amount,
                paymentDateTimeUTC: paymentRecord.paymentDateTimeUTC,
                currency: paymentRecord.currency,
                paymentMode: paymentRecord.paymentMode,
                remark: paymentRecord.remark,
                createdAtUTC: paymentRecord.createdAtUTC,
                createdBy: paymentRecord.createdBy,
                updatedAtUTC: paymentRecord.updatedAtUTC,
                updatedBy: paymentRecord.updatedBy
            });

            const [paymentTotal] = await tx.select({ total: drizzleSum(packagePaymentTable.amount) })
                .from(packagePaymentTable)
                .where(drizzleEq(packagePaymentTable.prepaidPackageId, id));

            const balance = Number(prepaidPackage.price ?? 0) - Number(paymentTotal?.total ?? 0);
            await tx.update(prepaidPackageTable)
                .set({
                    balance,
                    paymentStatus: getPaymentStatus(balance),
                    packageStatus: getPackageStatus(Number(prepaidPackage.daysUsed ?? 0), Number(prepaidPackage.noOfDays ?? 0)),
                    updatedAtUTC: new Date(),
                    updatedBy: sessionUser.id
                })
                .where(drizzleEq(prepaidPackageTable.id, id));
        });

        return paymentRecord;
    }


    async prepaidPackagePaymentUpdate(id: string, paymentId: string, payment: PrepaidPackagePayment, sessionUser: SessionUser): Promise<PrepaidPackagePayment> {
        if (!sessionUser?.id) throw new CustomError('Invalid session user.');
        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const paymentRecord = Object.assign(new PrepaidPackagePayment(), payment, {
            id: paymentId,
            prepaidPackageId: id,
            updatedAtUTC: new Date(),
            updatedBy: sessionUser.id
        });

        await this.dbClient.db.transaction(async (tx) => {
            const [prepaidPackage] = await tx.select({
                id: prepaidPackageTable.id,
                price: prepaidPackageTable.price,
                daysUsed: prepaidPackageTable.daysUsed,
                noOfDays: prepaidPackageTable.noOfDays
            })
                .from(prepaidPackageTable)
                .where(drizzleAnd(
                    drizzleEq(prepaidPackageTable.id, id),
                    drizzleEq(prepaidPackageTable.location, sessionUser.location!)
                ))
                .for('update');

            if (!prepaidPackage) throw new CustomError('Prepaid package not found.', HttpStatusCode.NotFound);

            const [existingPayment] = await tx.select({ id: packagePaymentTable.id })
                .from(packagePaymentTable)
                .where(drizzleAnd(
                    drizzleEq(packagePaymentTable.id, paymentId),
                    drizzleEq(packagePaymentTable.prepaidPackageId, id)
                ));

            if (!existingPayment) throw new CustomError('Package payment not found.', HttpStatusCode.NotFound);

            await tx.update(packagePaymentTable)
                .set({
                    amount: paymentRecord.amount,
                    paymentDateTimeUTC: paymentRecord.paymentDateTimeUTC,
                    currency: paymentRecord.currency,
                    paymentMode: paymentRecord.paymentMode,
                    remark: paymentRecord.remark,
                    updatedAtUTC: paymentRecord.updatedAtUTC,
                    updatedBy: paymentRecord.updatedBy
                })
                .where(drizzleEq(packagePaymentTable.id, paymentId));

            const [paymentTotal] = await tx.select({ total: drizzleSum(packagePaymentTable.amount) })
                .from(packagePaymentTable)
                .where(drizzleEq(packagePaymentTable.prepaidPackageId, id));

            const balance = Number(prepaidPackage.price ?? 0) - Number(paymentTotal?.total ?? 0);
            await tx.update(prepaidPackageTable)
                .set({
                    balance,
                    paymentStatus: getPaymentStatus(balance),
                    packageStatus: getPackageStatus(Number(prepaidPackage.daysUsed ?? 0), Number(prepaidPackage.noOfDays ?? 0)),
                    updatedAtUTC: new Date(),
                    updatedBy: sessionUser.id
                })
                .where(drizzleEq(prepaidPackageTable.id, id));
        });

        return paymentRecord;
    }


    async prepaidPackagePaymentDelete(id: string, paymentId: string, sessionUser: SessionUser): Promise<void> {
        if (!sessionUser?.id) throw new CustomError('Invalid session user.');
        if (!sessionUser?.location) throw new CustomError('Location is required.');

        await this.dbClient.db.transaction(async (tx) => {
            const [prepaidPackage] = await tx.select({
                id: prepaidPackageTable.id,
                price: prepaidPackageTable.price,
                daysUsed: prepaidPackageTable.daysUsed,
                noOfDays: prepaidPackageTable.noOfDays
            })
                .from(prepaidPackageTable)
                .where(drizzleAnd(
                    drizzleEq(prepaidPackageTable.id, id),
                    drizzleEq(prepaidPackageTable.location, sessionUser.location!)
                ))
                .for('update');

            if (!prepaidPackage) throw new CustomError('Prepaid package not found.', HttpStatusCode.NotFound);

            const [existingPayment] = await tx.select({ id: packagePaymentTable.id })
                .from(packagePaymentTable)
                .where(drizzleAnd(
                    drizzleEq(packagePaymentTable.id, paymentId),
                    drizzleEq(packagePaymentTable.prepaidPackageId, id)
                ));

            if (!existingPayment) throw new CustomError('Package payment not found.', HttpStatusCode.NotFound);

            await tx.delete(packagePaymentTable)
                .where(drizzleEq(packagePaymentTable.id, paymentId));

            const [paymentTotal] = await tx.select({ total: drizzleSum(packagePaymentTable.amount) })
                .from(packagePaymentTable)
                .where(drizzleEq(packagePaymentTable.prepaidPackageId, id));

            const balance = Number(prepaidPackage.price ?? 0) - Number(paymentTotal?.total ?? 0);
            await tx.update(prepaidPackageTable)
                .set({
                    balance,
                    paymentStatus: getPaymentStatus(balance),
                    packageStatus: getPackageStatus(Number(prepaidPackage.daysUsed ?? 0), Number(prepaidPackage.noOfDays ?? 0)),
                    updatedAtUTC: new Date(),
                    updatedBy: sessionUser.id
                })
                .where(drizzleEq(prepaidPackageTable.id, id));
        });
    }
}