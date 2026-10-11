import { injectable, inject } from 'inversify';

import c from '@/lib/loggers/console/ConsoleLogger';
import { PagerParams, TYPES } from '@/core/types';
import SessionUser from '../models/dto/SessionUser';
import type IRepository from '@/lib/repositories/IRepository';
import PrepaidPackage from '../models/domain/PrepaidPackage';
import type IPrepaidPackageService from './contracts/IPrepaidPackageService';
import { and, asc, desc, eq, inList } from '@/lib/transformers/types';
import { CustomError } from '@/lib/errors';
import Customer from '../models/domain/Customer';
import Config from '../models/domain/Config';
import { ConfigGroup } from '@/core/constants';


@injectable()
export default class PrepaidPackageService implements IPrepaidPackageService {

    constructor(
        @inject(TYPES.IConfigRepository) private configRepository: IRepository<Config>,
        @inject(TYPES.ICustomerRepository) private customerRepository: IRepository<Customer>,
        @inject(TYPES.IPrepaidPackageRepository) private prepaidPackageRepository: IRepository<PrepaidPackage>
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

        const packageType = await this.configRepository.findOne(
            and(eq('group', ConfigGroup.PREPAID_PACKAGE_TYPE), eq('id', prepaidPackage.prepaidPackageTypeId))
        );
        if (!packageType) throw new CustomError('Prepaid package type not found.');

        prepaidPackage.location = sessionUser.location;
        prepaidPackage.balance = Number(prepaidPackage.price ?? 0) - Number(prepaidPackage.deposit ?? 0);
        prepaidPackage.createdAtUTC = new Date();
        prepaidPackage.createdBy = sessionUser.id;
        prepaidPackage.updatedAtUTC = new Date();
        prepaidPackage.updatedBy = sessionUser.id;

        const created = await this.prepaidPackageRepository.create(prepaidPackage);
        c.fe('PrepaidPackageService > prepaidPackageCreate');
        return created;
    }


    async prepaidPackageFindMany(pagerParams: PagerParams, sessionUser: SessionUser): Promise<[PrepaidPackage[], number]> {
        c.fs('PrepaidPackageService > prepaidPackageFindMany');
        c.d(pagerParams);
        c.d(sessionUser);

        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const pageIndex = pagerParams.pageIndex ?? 1;
        const pageSize = pagerParams.pageSize ?? 10;
        const offset = (pageIndex - 1) * pageSize;

        const [packages, total] = await this.prepaidPackageRepository.findMany(
            eq('location', sessionUser.location),
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
                ? await this.configRepository.findMany(and(eq('group', ConfigGroup.PREPAID_PACKAGE_TYPE), inList('id', packageTypeIds)))
                : [[], 0];

            const customerMap = new Map(customers.map(x => [x.id, x]));
            const packageTypeMap = new Map(packageTypes.map(x => [x.id, x]));

            packages.forEach(item => {
                const customer = customerMap.get(item.customerId);
                const packageType = packageTypeMap.get(item.prepaidPackageTypeId);

                item.customerName = customer?.name ?? '';
                item.customerEnglishName = customer?.englishName ?? '';
                item.prepaidPackageTypeText = packageType?.text ?? '';
            });
        }

        c.fe('PrepaidPackageService > prepaidPackageFindMany');
        return [packages, total];
    }


    async prepaidPackageTypeFindMany(sessionUser: SessionUser): Promise<Config[]> {
        c.fs('PrepaidPackageService > prepaidPackageTypeFindMany');

        if (!sessionUser?.location) throw new CustomError('Location is required.');

        const [packageTypes] = await this.configRepository.findMany(
            eq('group', ConfigGroup.PREPAID_PACKAGE_TYPE),
            asc('text')
        );

        c.fe('PrepaidPackageService > prepaidPackageTypeFindMany');
        return packageTypes;
    }
}