import { Container } from 'inversify';
import "reflect-metadata";
import '@/lib/extensions/dateextensions';

import IUserService from '@/core/services/contracts/IUserService';
import UserService from '@/core/services/UserService';
import { IDatabaseClient } from '@/lib/db/IDatabase';
import { MySqlDatabaseClient, MySqlDbType } from '@/core/db/mysql/MySqlDatabase';
import { TYPES } from '@/core/types';
import IAuthService from '../../core/services/contracts/IAuthService';
import AuthService from '../../core/services/AuthService';
import ICustomerService from '../../core/services/contracts/ICustomerService';
import CustomerService from '../../core/services/CustomerService';
import IReservationRepository from '@/core/repositories/contracts/IReservationRepository';
import ReservationRepository from '@/core/repositories/drizzle/ReservationRepository';
import ReservationService from '@/core/services/ReservationService';
import IReservationService from '@/core/services/contracts/IReservationService';
import IReportRepository from '@/core/repositories/contracts/IReportRepository';
import ReportRepository from '@/core/repositories/drizzle/ReportRepository';
import IReportService from '@/core/services/contracts/IReportService';
import ReportService from '@/core/services/ReportService';
import ILogService from '@/core/services/contracts/ILogService';
import LogService from '@/core/services/LogService';
import { billTable, configTable, customerTable, logErrorTable, paymentTable, prepaidTable, promotionTable, reservationCustomerTable, reservationTable, roomChargeTable, roomRateTable, roomReservationTable, roomTable, roomTypeTable, userTable } from '@/core/orms/drizzle/mysql/schema';
import { Repository } from '@/lib/repositories/drizzle/Repository';
import IRepository from '@/lib/repositories/IRepository';
import CustomMapper from '@/lib/mappers/custommapper/CustomMapper';
import IMapper from '@/lib/mappers/IMapper';
import RoomReservation from '@/core/models/domain/RoomReservation';
import RoomChargeEntity from '@/core/models/entity/RoomChargeEntity';
import RoomCharge from '@/core/models/domain/RoomCharge';
import Room from '@/core/models/domain/Room';
import Customer from '@/core/models/domain/Customer';
import Bill from '@/core/models/domain/Bill';
import User from '@/core/models/domain/User';
import IQueryTranformer from '@/lib/transformers/IQueryTransformer';
import CustomerEntity from '@/core/models/entity/CustomerEntity';
import BillEntity from '@/core/models/entity/BillEntity';
import RoomEntity from '@/core/models/entity/RoomEntity';
import RoomReservationEntity from '@/core/models/entity/RoomReservationEntity';
import UserEntity from '@/core/models/entity/UserEntity';
import LogError from '@/core/models/domain/LogError';
import LogErrorEntity from '@/core/models/entity/LogErrorEntity';
import Config from '@/core/models/domain/Config';
import ConfigEntity from '@/core/models/entity/ConfigEntity';
import Payment from '@/core/models/domain/Payment';
import PaymentEntity from '@/core/models/entity/PaymentEntity';
import ReservationCustomer from '@/core/models/domain/ReservationCustomer';
import ReservationCustomerEntity from '@/core/models/entity/ReservationCustomerEntity';
import RoomRate from '@/core/models/domain/RoomRate';
import RoomRateEntity from '@/core/models/entity/RoomRateEntity';
import RoomType from '@/core/models/domain/RoomType';
import RoomTypeEntity from '@/core/models/entity/RoomTypeEntity';
import PrepaidEntity from '@/core/models/entity/PrepaidEntity';
import PromotionEntity from '@/core/models/entity/PromotionEntity';
import { DrizzleQueryTransformer } from '@/lib/transformers/drizzle/DrizzleQueryTransformer';
import { eq, SQL } from 'drizzle-orm';
import { MySqlSelect } from 'drizzle-orm/mysql-core';
import { CacheRepository } from '@/lib/repositories/drizzle/CacheRepository';

// create a DI container
const container = new Container();

// Bind as singleton
container.bind<IDatabaseClient<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabaseClient).inSingletonScope();
container.bind<IMapper>(TYPES.IMapper).to(CustomMapper).inSingletonScope();
container.bind<IQueryTranformer>(TYPES.IQueryTransformer).to(DrizzleQueryTransformer).inSingletonScope();

// Bind Services
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope();
container.bind<ICustomerService>(TYPES.ICustomerService).to(CustomerService).inSingletonScope();
container.bind<ILogService>(TYPES.ILogService).to(LogService).inSingletonScope();
container.bind<IReportService>(TYPES.IReportService).to(ReportService).inSingletonScope();
container.bind<IReservationService>(TYPES.IReservationService).to(ReservationService).inSingletonScope();
container.bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();

// Bind Repositories
container.bind<IRepository<Bill>>(TYPES.IBillRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        billTable,
        { ...billTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        Bill,
        BillEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<Config>>(TYPES.IConfigRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        configTable,
        { ...configTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        Config,
        ConfigEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<Customer>>(TYPES.ICustomerRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        customerTable,
        { ...customerTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        Customer,
        CustomerEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<LogError>>(TYPES.ILogRepository).toDynamicValue(context => {
    return new CacheRepository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        logErrorTable,
        { ...logErrorTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        LogError,
        LogErrorEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<Payment>>(TYPES.IPaymentRepository).toDynamicValue(context => {
    return new CacheRepository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        paymentTable,
        { ...paymentTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        Payment,
        PaymentEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<PrepaidEntity>>(TYPES.IPrepaidRepository).toDynamicValue(context => {
    return new CacheRepository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        prepaidTable,
        { ...prepaidTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        PrepaidEntity,
        PrepaidEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<PromotionEntity>>(TYPES.IPromotionRepository).toDynamicValue(context => {
    return new CacheRepository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        promotionTable,
        { ...promotionTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        PromotionEntity,
        PromotionEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IReportRepository>(TYPES.IReportRepository).to(ReportRepository);

container.bind<IReservationRepository>(TYPES.IReservationRepository).to(ReservationRepository);

container.bind<IRepository<ReservationCustomer>>(TYPES.IReservationCustomerRepository).toDynamicValue(context => {
    return new CacheRepository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        reservationCustomerTable,
        { ...reservationCustomerTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        ReservationCustomer,
        ReservationCustomerEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<Room>>(TYPES.IRoomRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomTable,
        { ...roomTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        Room,
        RoomEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<RoomCharge>>(TYPES.IRoomChargeRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomChargeTable,
        { 
            ...roomChargeTable,
            roomNo: roomTable.roomNo,
            roomType: roomTypeTable.roomType,
            roomTypeText: roomTypeTable.roomTypeText
        },
        (q) => {
            return q.innerJoin(roomTypeTable, eq(roomTypeTable.id, roomChargeTable.roomTypeId))
                .innerJoin(roomTable, eq(roomTable.id, roomChargeTable.roomId));
        },
        context.get<IMapper>(TYPES.IMapper),
        RoomCharge,
        RoomChargeEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<RoomRate>>(TYPES.IRoomRateRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomRateTable,
        { ...roomRateTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        RoomRate,
        RoomRateEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<RoomReservation>>(TYPES.IRoomReservationRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomReservationTable,
        {
            ...roomReservationTable,
            roomNo: roomTable.roomNo,
            roomType: roomTypeTable.roomType,
            roomTypeId: roomTypeTable.id
        },
        (q: MySqlSelect) => {
            return q.innerJoin(roomTable, eq(roomTable.id, roomReservationTable.roomId))
                .innerJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.roomTypeId));
        },
        context.get<IMapper>(TYPES.IMapper),
        RoomReservation,
        RoomReservationEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<User>>(TYPES.IUserRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        userTable,
        { ...userTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        User,
        UserEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

container.bind<IRepository<RoomType>>(TYPES.IRoomTypeRepository).toDynamicValue(context => {
    return new CacheRepository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomTypeTable,
        { ...roomTypeTable },
        (q) => q,
        context.get<IMapper>(TYPES.IMapper),
        RoomType,
        RoomTypeEntity,
        context.get<IQueryTranformer>(TYPES.IQueryTransformer)
    )
});

export { container };