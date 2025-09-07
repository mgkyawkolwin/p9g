import { Container } from 'inversify';
//import { interfaces, Controller } from 'inversify-express-utils';
import "reflect-metadata";
import '@/core/lib/extensions/dateextensions';

import IUserService from '@/core/domain/services/contracts/IUserService';
import UserService from '@/core/domain/services/UserService';
import { IDatabase } from '@/core/data/db/IDatabase';
import { MySqlDatabase, MySqlDbType } from '@/core/data/db/mysql/MySqlDatabase';
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
import IRoomChargeRepository from './core/data/repo/contracts/IRoomChargeRepository';
import RoomRepository from './core/data/repo/drizzle/RoomRepository';
import RoomChargeRepository from './core/data/repo/drizzle/RoomChargeRepository';
import RoomReservationRepository from './core/data/repo/drizzle/RoomReservationRepository';
import IRoomReservationRepository from './core/data/repo/contracts/IRoomReservationRepository';

// create a DI container
const container = new Container();

// Bind as singleton
container.bind<IDatabase<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabase).inSingletonScope();

// Bind Services
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
container.bind<ICustomerService>(TYPES.ICustomerService).to(CustomerService);
container.bind<ILogService>(TYPES.ILogService).to(LogService);
container.bind<IReportService>(TYPES.IReportService).to(ReportService);
container.bind<IReservationService>(TYPES.IReservationService).to(ReservationService);
container.bind<IUserService>(TYPES.IUserService).to(UserService);

// Bind Repositories
container.bind<ICustomerRepository>(TYPES.ICustomerRepository).to(CustomerRepository);
container.bind<ILogRepository>(TYPES.ILogRepository).to(LogRepository);
container.bind<IReportRepository>(TYPES.IReportRepository).to(ReportRepository);
container.bind<IReservationRepository>(TYPES.IReservationRepository).to(ReservationRepository);
container.bind<IRoomRepository>(TYPES.IRoomRepository).to(RoomRepository);
container.bind<IRoomChargeRepository>(TYPES.IRoomChargeRepository).to(RoomChargeRepository);
container.bind<IRoomReservationRepository>(TYPES.IRoomReservationRepository).to(RoomReservationRepository);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);

export { container };