import { injectable } from 'inversify';
import { MySql2Database, drizzle} from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { IDatabase } from '../IDatabase';
import * as schema from '@/data/orm/drizzle/mysql/schema';

export type MySqlDbType = MySql2Database<typeof schema>;

@injectable()
export class MySqlDatabase implements IDatabase<MySqlDbType>{
  private _db: MySqlDbType;

  constructor() {
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL!,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      idleTimeout: 60000,
      enableKeepAlive: true
    });
    this._db = drizzle(pool, { schema, mode: 'default' });
  }

  public get db(): MySqlDbType {
    return this._db;
  }
}