import { Container } from 'inversify';
//import { interfaces, Controller } from 'inversify-express-utils';
import "reflect-metadata";

import IUserService from '@/domain/services/contracts/IUserService';
import UserService from '@/domain/services/UserService';
import { IDatabase } from '@/data/db/IDatabase';
import { MySqlDatabase, MySqlDbType } from '@/data/db/mysql/MySqlDatabase';
import { TYPES } from './lib/types';
import IUserRepository from './data/repo/contracts/IUserRepository';
import UserRepository from './data/repo/drizzle/UserRepository';
import IAuthService from './domain/services/contracts/IAuthService';
import AuthService from './domain/services/AuthService';
import ICustomerService from './domain/services/contracts/ICustomerService';
import CustomerService from './domain/services/CustomerService';
import ICustomerRepository from './data/repo/contracts/ICustomerRepository';
import CustomerRepository from './data/repo/drizzle/CustomerRepository';
import IReservationRepository from './data/repo/contracts/IReservationRepository';
import ReservationRepository from './data/repo/drizzle/ReservationRepository';
import ReservationService from './domain/services/ReservationService';
import IReservationService from './domain/services/contracts/IReservationService';
import ILogRepository from './data/repo/contracts/ILogRepository';
import LogRepository from './data/repo/drizzle/LogRepository';
import IReportRepository from './data/repo/contracts/IReportRepository';
import ReportRepository from './data/repo/drizzle/ReportRepository';
import IReportService from './domain/services/contracts/IReportService';
import ReportService from './domain/services/ReportService';
import ILogService from './domain/services/contracts/ILogService';
import LogService from './domain/services/LogService';

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
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);

export { container };