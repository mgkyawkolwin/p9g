import { Container } from 'inversify';
//import { interfaces, Controller } from 'inversify-express-utils';
import "reflect-metadata";

import IUserService from '@/domain/services/contracts/IUserService';
import UserService from '@/domain/services/UserService';
import { IDatabase } from '@/data/db/IDatabase';
import { MySqlDatabase, MySqlDbType } from '@/data/db/mysql/MySqlDatabase';
import { TYPES } from './lib/types';
import IUserRepository from './data/repo/IUserRepository';
import UserRepository from './data/repo/drizzle/UserRepository';
import IAuthService from './domain/services/contracts/IAuthService';
import AuthService from './domain/services/AuthService';
import ICustomerService from './domain/services/contracts/ICustomerService';
import CustomerService from './domain/services/ICustomerService';
import ICustomerRepository from './data/repo/ICustomerRepository';
import CustomerRepository from './data/repo/drizzle/CustomerRepository';
import IReservationRepository from './data/repo/IReservationRepository';
import ReservationRepository from './data/repo/drizzle/ReservationRepository';
import ReservationService from './domain/services/ReservationService';
import IReservationService from './domain/services/contracts/IReservationService';

// create a DI container
const container = new Container();

// Bind as singleton
container.bind<IDatabase<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabase).inSingletonScope();

// Bind Services
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
container.bind<ICustomerService>(TYPES.ICustomerService).to(CustomerService);
container.bind<IReservationService>(TYPES.IReservationService).to(ReservationService);
container.bind<IUserService>(TYPES.IUserService).to(UserService);

// Bind Repositories
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<ICustomerRepository>(TYPES.ICustomerRepository).to(CustomerRepository);
container.bind<IReservationRepository>(TYPES.IReservationRepository).to(ReservationRepository)

export { container };