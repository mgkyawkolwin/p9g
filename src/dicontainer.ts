import { Container } from 'inversify';
//import { interfaces, Controller } from 'inversify-express-utils';
import "reflect-metadata";
import '@/core/lib/extensions/dateextensions';

import IUserService from '@/core/domain/services/contracts/IUserService';
import UserService from '@/core/domain/services/UserService';
import { IDatabaseClient } from '@/core/data/db/IDatabase';
import { MySqlDatabaseClient, MySqlDbType } from '@/core/data/db/mysql/MySqlDatabase';
import { TYPES } from './core/lib/types';
import IAuthService from './core/domain/services/contracts/IAuthService';
import AuthService from './core/domain/services/AuthService';
import ICustomerService from './core/domain/services/contracts/ICustomerService';
import CustomerService from './core/domain/services/CustomerService';
import IReservationRepository from './core/data/repo/contracts/IReservationRepository';
import ReservationRepository from './core/data/repo/drizzle/ReservationRepository';
import ReservationService from './core/domain/services/ReservationService';
import IReservationService from './core/domain/services/contracts/IReservationService';
import IReportRepository from './core/data/repo/contracts/IReportRepository';
import ReportRepository from './core/data/repo/drizzle/ReportRepository';
import IReportService from './core/domain/services/contracts/IReportService';
import ReportService from './core/domain/services/ReportService';
import ILogService from './core/domain/services/contracts/ILogService';
import LogService from './core/domain/services/LogService';
// import IRoomChargeRepository from './core/data/repo/contracts/IRoomChargeRepository';
// import RoomChargeRepository from './core/data/repo/drizzle/RoomChargeRepository';
// import RoomReservationRepository from './core/data/repo/drizzle/RoomReservationRepository';
// import IRoomReservationRepository from './core/data/repo/contracts/IRoomReservationRepository';
// import RoomCharge from './core/domain/models/RoomCharge';
import { billTable, configTable, customerTable, logErrorTable, paymentTable, prepaidTable, reservationCustomerTable, reservationTable, roomChargeTable, roomRateTable, roomReservationTable, roomTable, roomTypeTable, userTable } from './core/data/orm/drizzle/mysql/schema';
import { Repository } from './core/data/repo/drizzle/Repository';
import IRepository from './core/data/repo/contracts/IRepository';
import CustomMapper from './core/lib/mappers/custommapper/CustomMapper';
import IMapper from './core/lib/mappers/IMapper';
import RoomReservation from './core/domain/models/RoomReservation';
import RoomChargeEntity from '@/core/data/entity/RoomChargeEntity';
import RoomCharge from './core/domain/models/RoomCharge';
import Room from './core/domain/models/Room';
import Reservation from './core/domain/models/Reservation';
import Customer from './core/domain/models/Customer';
import Bill from './core/domain/models/Bill';
import User from './core/domain/models/User';
import IQueryObjectTranformer from '@/core/lib/transformers/IQueryObjectTransformer';
import DrizzleQueryObjectTransformer from './core/lib/transformers/QueryObjectTransformer';
import CustomerEntity from './core/data/entity/CustomerEntity';
import BillEntity from './core/data/entity/BillEntity';
import ReservationEntity from './core/data/entity/ReservationEntity';
import RoomEntity from './core/data/entity/RoomEntity';
import RoomReservationEntity from './core/data/entity/RoomReservationEntity';
import UserNew from './app/(private)/console/users/new/usernew';
import UserEntity from './core/data/entity/UserEntity';
import LogError from './core/domain/models/LogError';
import LogErrorEntity from './core/data/entity/LogErrorEntity';
import Config from './core/domain/models/Config';
import ConfigEntity from './core/data/entity/ConfigEntity';
import Payment from './core/domain/models/Payment';
import PaymentEntity from './core/data/entity/PaymentEntity';
import ReservationCustomer from './core/domain/models/ReservationCustomer';
import ReservationCustomerEntity from './core/data/entity/ReservationCustomerEntity';
import RoomRate from './core/domain/models/RoomRate';
import RoomRateEntity from './core/data/entity/RoomRateEntity';
import RoomType from './core/domain/models/RoomType';
import RoomTypeEntity from './core/data/entity/RoomTypeEntity';
import PrepaidEntity from './core/data/entity/PrepaidEntity';
import PromotionEntity from './core/data/entity/PromotionEntity';

// create a DI container
const container = new Container();

// Bind as singleton
container.bind<IDatabaseClient<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabaseClient).inSingletonScope();
container.bind<IMapper>(TYPES.IMapper).to(CustomMapper).inSingletonScope();
container.bind<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer).to(DrizzleQueryObjectTransformer).inSingletonScope();

// Bind Services
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope();
container.bind<ICustomerService>(TYPES.ICustomerService).to(CustomerService).inSingletonScope();
container.bind<ILogService>(TYPES.ILogService).to(LogService).inSingletonScope();
container.bind<IReportService>(TYPES.IReportService).to(ReportService).inSingletonScope();
container.bind<IReservationService>(TYPES.IReservationService).to(ReservationService).inSingletonScope();
container.bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();

// Bind Repositories
// container.bind<IRepository<BillEntity>>(TYPES.IRoomChargeRepository).to(Repository<BillEntity, typeof billTable>);
container.bind<IRepository<Bill>>(TYPES.IBillRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        billTable,
        context.get<IMapper>(TYPES.IMapper),
        Bill,
        BillEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

container.bind<IRepository<Config>>(TYPES.IConfigRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        configTable,
        context.get<IMapper>(TYPES.IMapper),
        Config,
        ConfigEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

// container.bind<ICustomerRepository>(TYPES.ICustomerRepository).to(CustomerRepository);
container.bind<IRepository<Customer>>(TYPES.ICustomerRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        customerTable,
        context.get<IMapper>(TYPES.IMapper),
        Customer,
        CustomerEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

// container.bind<ILogRepository>(TYPES.ILogRepository).to(LogRepository);
container.bind<IRepository<LogError>>(TYPES.ILogRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        logErrorTable,
        context.get<IMapper>(TYPES.IMapper),
        LogError,
        LogErrorEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

// container.bind<ILogRepository>(TYPES.ILogRepository).to(LogRepository);
container.bind<IRepository<Payment>>(TYPES.IPaymentRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        paymentTable,
        context.get<IMapper>(TYPES.IMapper),
        Payment,
        PaymentEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

container.bind<IRepository<PrepaidEntity>>(TYPES.IPrepaidRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        prepaidTable,
        context.get<IMapper>(TYPES.IMapper),
        PrepaidEntity,
        PrepaidEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

container.bind<IRepository<PromotionEntity>>(TYPES.IPromotionRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        prepaidTable,
        context.get<IMapper>(TYPES.IMapper),
        PromotionEntity,
        PromotionEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

container.bind<IReportRepository>(TYPES.IReportRepository).to(ReportRepository);
// container.bind<IRepository<Reservation>>(TYPES.IReservationRepository).toDynamicValue(context => {
//     return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
//         roomChargeTable,
//         context.get<IMapper>(TYPES.IMapper),
//         Reservation,
//         RoomChargeEntity
//     )
// });

container.bind<IReservationRepository>(TYPES.IReservationRepository).to(ReservationRepository);
// container.bind<IReservationRepository>(TYPES.IReservationRepository).toDynamicValue(context => {
//     return new ReservationRepository(
//         context.get<IDatabaseClient<any>>(TYPES.IDatabase),
//         reservationTable,
//         context.get<IMapper>(TYPES.IMapper)
//     )
// });

// container.bind<ILogRepository>(TYPES.ILogRepository).to(LogRepository);
container.bind<IRepository<ReservationCustomer>>(TYPES.IReservationCustomerRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        reservationCustomerTable,
        context.get<IMapper>(TYPES.IMapper),
        ReservationCustomer,
        ReservationCustomerEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

// container.bind<IRoomRepository>(TYPES.IRoomRepository).to(RoomRepository);
container.bind<IRepository<Room>>(TYPES.IRoomRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomTable,
        context.get<IMapper>(TYPES.IMapper),
        Room,
        RoomEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});
// container.bind<IRepository<RoomChargeEntity>>(TYPES.IRoomChargeRepository).to(Repository<RoomChargeEntity, typeof roomChargeTable>);
container.bind<IRepository<RoomCharge>>(TYPES.IRoomChargeRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomChargeTable,
        context.get<IMapper>(TYPES.IMapper),
        RoomCharge,
        RoomChargeEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

container.bind<IRepository<RoomRate>>(TYPES.IRoomRateRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomRateTable,
        context.get<IMapper>(TYPES.IMapper),
        RoomRate,
        RoomRateEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

container.bind<IRepository<RoomReservation>>(TYPES.IRoomReservationRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomReservationTable,
        context.get<IMapper>(TYPES.IMapper),
        RoomReservation,
        RoomReservationEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

// container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<IRepository<User>>(TYPES.IUserRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        userTable,
        context.get<IMapper>(TYPES.IMapper),
        User,
        UserEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

container.bind<IRepository<RoomType>>(TYPES.IRoomTypeRepository).toDynamicValue(context => {
    return new Repository(
        context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomTypeTable,
        context.get<IMapper>(TYPES.IMapper),
        RoomType,
        RoomTypeEntity,
        context.get<IQueryObjectTranformer>(TYPES.IQueryObjectTransformer)
    )
});

export { container };