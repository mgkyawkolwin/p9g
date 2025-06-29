import { Container } from 'inversify';
//import { interfaces, Controller } from 'inversify-express-utils';
import "reflect-metadata";

import IUserService from '@/services/contracts/IUserService';
import UserService from '@/services/UserService';
import { IDatabase } from '@/data/db/IDatabase';
import { MySqlDatabase, MySqlDbType } from '@/data/db/mysql/MySqlDatabase';
import { TYPES } from './lib/types';
import IUserRepository from './data/repo/IUserRepository';
import UserRepository from './data/repo/drizzle/UserRepository';
import IAuthService from './services/contracts/IAuthService';
import AuthService from './services/AuthService';
import ICustomerService from './services/contracts/ICustomerService';
import CustomerService from './services/ICustomerService';
import ICustomerRepository from './data/repo/ICustomerRepository';
import CustomerRepository from './data/repo/drizzle/CustomerRepository';

// create a DI container
const container = new Container();

// Bind as singleton
container.bind<IDatabase<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabase).inSingletonScope();

// Bind Services
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
container.bind<ICustomerService>(TYPES.ICustomerService).to(CustomerService);
container.bind<IUserService>(TYPES.IUserService).to(UserService);

// Bind Repositories
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<ICustomerRepository>(TYPES.ICustomerRepository).to(CustomerRepository);

export { container };