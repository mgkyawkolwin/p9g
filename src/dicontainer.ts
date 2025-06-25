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

// create a DI container
const container = new Container();

// Bind as singleton
container.bind<IDatabase<MySqlDbType>>(TYPES.IDatabase).to(MySqlDatabase).inSingletonScope();

// Bind Services
container.bind<IUserService>(TYPES.IUserServce).to(UserService);

// Bind Repositories
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);

export { container };