import { Container } from 'inversify';
//import { interfaces, Controller } from 'inversify-express-utils';
import "reflect-metadata";
import '@/core/lib/extensions/dateextensions';

import IUserService from '@/core/domain/services/contracts/IUserService';
import UserService from '@/core/domain/services/UserService';
import { IDatabaseClient } from '@/core/data/db/IDatabase';
import { MySqlDatabaseClient, MySqlDbType } from '@/core/data/db/mysql/MySqlDatabase';
import { TYPES } from './core/lib/types';
import IUserRepository from './core/data/repo/contracts/IUserRepository';
import UserRepository from './core/data/repo/drizzle/UserRepository';
import IAuthService from './core/domain/services/contracts/IAuthService';
import AuthService from './core/domain/services/AuthService';
import ICustomerService from './core/domain/services/contracts/ICustomerService';
import CustomerService from './core/domain/services/CustomerService';
import ICustomerRepository from './core/data/repo/contracts/ICustomerRepository';
import CustomerRepository from './core/data/repo/drizzle/CustomerRepository';
import IReservationRepository from './core/data/repo/contracts/IReservationRepository';
import ReservationRepository from './core/data/repo/drizzle/ReservationRepository';
import ReservationService from './core/domain/services/ReservationService';
import IReservationService from './core/domain/services/contracts/IReservationService';
import ILogRepository from './core/data/repo/contracts/ILogRepository';
import LogRepository from './core/data/repo/drizzle/LogRepository';
import IReportRepository from './core/data/repo/contracts/IReportRepository';
import ReportRepository from './core/data/repo/drizzle/ReportRepository';
import IReportService from './core/domain/services/contracts/IReportService';
import ReportService from './core/domain/services/ReportService';
import ILogService from './core/domain/services/contracts/ILogService';
import LogService from './core/domain/services/LogService';
import IRoomRepository from './core/data/repo/contracts/IRoomRepository';
// import IRoomChargeRepository from './core/data/repo/contracts/IRoomChargeRepository';
import RoomRepository from './core/data/repo/drizzle/RoomRepository';
// import RoomChargeRepository from './core/data/repo/drizzle/RoomChargeRepository';
// import RoomReservationRepository from './core/data/repo/drizzle/RoomReservationRepository';
// import IRoomReservationRepository from './core/data/repo/contracts/IRoomReservationRepository';
// import RoomCharge from './core/domain/models/RoomCharge';
import { BillEntity, billTable, customerTable, roomChargeTable, RoomReservationEntity, roomReservationTable, userTable } from './core/data/orm/drizzle/mysql/schema';
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
import QueryObjectTransformer from './core/lib/transformers/QueryObjectTransformer';
import CustomerEntity from './core/data/entity/CustomerEntity';

// create a DI container
const container = new Container();

// Bind as singleton
container.bind<IDatabaseClient<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabaseClient).inSingletonScope();
container.bind<IMapper>(TYPES.IMapper).to(CustomMapper).inSingletonScope();
container.bind<IQueryObjectTranformer<any,any>>(TYPES.IQueryObjectTransformer).to(QueryObjectTransformer).inSingletonScope();

// Bind Services
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope();
container.bind<ICustomerService>(TYPES.ICustomerService).to(CustomerService).inSingletonScope();
container.bind<ILogService>(TYPES.ILogService).to(LogService).inSingletonScope();
container.bind<IReportService>(TYPES.IReportService).to(ReportService).inSingletonScope();
container.bind<IReservationService>(TYPES.IReservationService).to(ReservationService).inSingletonScope();
// container.bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();

// Bind Repositories
// container.bind<IRepository<BillEntity>>(TYPES.IRoomChargeRepository).to(Repository<BillEntity, typeof billTable>);
container.bind<IRepository<Bill>>(TYPES.IBillRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        customerTable,
        context.get<IMapper>(TYPES.IMapper),
        Bill,
        RoomChargeEntity
    )
});

// container.bind<ICustomerRepository>(TYPES.ICustomerRepository).to(CustomerRepository);
container.bind<IRepository<Customer>>(TYPES.ICustomerRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        customerTable,
        context.get<IMapper>(TYPES.IMapper),
        Customer,
        CustomerEntity
    )
});

// container.bind<ILogRepository>(TYPES.ILogRepository).to(LogRepository);
// container.bind<IRepository<Reservation>>(TYPES.IReservationRepository).toDynamicValue(context => {
//     return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
//         roomChargeTable,
//         context.get<IMapper>(TYPES.IMapper),
//         Reservation,
//         RoomChargeEntity
//     )
// });

// container.bind<IReportRepository>(TYPES.IReportRepository).to(ReportRepository);
// container.bind<IRepository<Reservation>>(TYPES.IReservationRepository).toDynamicValue(context => {
//     return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
//         roomChargeTable,
//         context.get<IMapper>(TYPES.IMapper),
//         Reservation,
//         RoomChargeEntity
//     )
// });

// container.bind<IReservationRepository>(TYPES.IReservationRepository).to(ReservationRepository);
container.bind<IRepository<Reservation>>(TYPES.IReservationRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomChargeTable,
        context.get<IMapper>(TYPES.IMapper),
        Reservation,
        RoomChargeEntity
    )
});

// container.bind<IRoomRepository>(TYPES.IRoomRepository).to(RoomRepository);
container.bind<IRepository<Room>>(TYPES.IRoomRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomChargeTable,
        context.get<IMapper>(TYPES.IMapper),
        Room,
        RoomChargeEntity
    )
});
// container.bind<IRepository<RoomChargeEntity>>(TYPES.IRoomChargeRepository).to(Repository<RoomChargeEntity, typeof roomChargeTable>);
container.bind<IRepository<RoomCharge>>(TYPES.IRoomChargeRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomChargeTable,
        context.get<IMapper>(TYPES.IMapper),
        RoomCharge,
        RoomChargeEntity
    )
});

container.bind<IRepository<RoomReservation>>(TYPES.IRoomReservationRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        roomReservationTable,
        context.get<IMapper>(TYPES.IMapper),
        RoomReservation,
        RoomChargeEntity
    )
});

// container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<IRepository<User>>(TYPES.IRoomReservationRepository).toDynamicValue(context => {
    return new Repository(context.get<IDatabaseClient<any>>(TYPES.IDatabase),
        userTable,
        context.get<IMapper>(TYPES.IMapper),
        User,
        RoomChargeEntity
    )
});

export { container };