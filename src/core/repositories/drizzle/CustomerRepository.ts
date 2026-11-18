import { injectable } from "inversify";
import { alias } from "drizzle-orm/mysql-core";
import { and, asc, count, eq, sql } from "drizzle-orm";

import Customer from "@/core/models/domain/Customer";
import CustomerEntity from "@/core/models/entity/CustomerEntity";
import SessionUser from "@/core/models/dto/SessionUser";
import { PagerParams, SearchFormFields } from "@/core/types";
import { buildAnyCondition } from "@/core/helpers";
import { configTable, customerTable, reservationCustomerTable, reservationTable } from "@/core/orms/drizzle/mysql/schema";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import type IMapper from "@/lib/mappers/IMapper";
import type IQueryTranformer from "@/lib/transformers/IQueryTransformer";
import { Repository } from "@/lib/repositories/drizzle/Repository";
import type ICustomerRepository from "../contracts/ICustomerRepository";

@injectable()
export default class CustomerRepository
  extends Repository<Customer, CustomerEntity, typeof customerTable>
  implements ICustomerRepository {

  constructor(
    dbClient: IDatabaseClient<any>,
    mapper: IMapper,
    transformer: IQueryTranformer
  ) {
    super(
      dbClient,
      customerTable,
      { ...customerTable },
      (query) => query,
      mapper,
      Customer,
      CustomerEntity,
      transformer
    );
  }

  async customerFindManyWithReservationCounts(
    searchFormFields: SearchFormFields,
    pagerParams: PagerParams,
    sessionUser: SessionUser
  ): Promise<[Customer[], number]> {
    const statusAlias = alias(configTable, "customer_reservation_status");
    const searchCondition = buildAnyCondition(searchFormFields);

    let dataQuery = this.dbClient.db
      .select({
        ...customerTable,
        cancelledReservations: sql<number>`cast(coalesce(sum(case when ${statusAlias.value} = 'CCL' then 1 else 0 end), 0) as unsigned)`,
        totalReservations: count(reservationTable.id)
      })
      .from(customerTable)
      .leftJoin(reservationCustomerTable, eq(reservationCustomerTable.customerId, customerTable.id))
      .leftJoin(reservationTable, eq(reservationTable.id, reservationCustomerTable.reservationId))
      .leftJoin(statusAlias, eq(statusAlias.id, reservationTable.reservationStatusId));

    let countQuery = this.dbClient.db
      .select({ count: count(customerTable.id) })
      .from(customerTable);

    const conditions: any[] = [];
    if (searchCondition) {
      const transformedSearch = await this.transformer.transformAsync<any>(searchCondition);
      if (transformedSearch) conditions.push(transformedSearch);
    }

    if (searchFormFields.searchShowZeroReservation === true || searchFormFields.searchShowZeroReservation === 'true') {
      conditions.push(sql`not exists (
        select 1
        from ${reservationCustomerTable}
        where ${reservationCustomerTable.customerId} = ${customerTable.id}
      )`);
    }

    if (conditions.length > 0) {
      const condition = and(...conditions);
      dataQuery = dataQuery.where(condition);
      countQuery = countQuery.where(condition);
    }

    dataQuery = dataQuery.groupBy(customerTable.id);

    if (searchFormFields.searchShowZeroReservation === true || searchFormFields.searchShowZeroReservation === 'true') {
      dataQuery = dataQuery.having(sql`count(${reservationTable.id}) = 0`);
    }

    dataQuery = dataQuery.orderBy(asc(customerTable.englishName), asc(customerTable.name));

    const offset = (pagerParams.pageIndex - 1) * pagerParams.pageSize;
    dataQuery = dataQuery.offset(offset).limit(pagerParams.pageSize);

    const [countResult, rows] = await Promise.all([
      countQuery.execute(),
      dataQuery.execute()
    ]);

    const customers = await Promise.all(rows.map(async (row) => {
      const customer = await this.mapper.mapAsync(row, Customer);
      customer.cancelledReservations = Number(row.cancelledReservations ?? 0);
      customer.totalReservations = Number(row.totalReservations ?? 0);
      return customer;
    }));

    return [customers, Number(countResult[0]?.count ?? 0)];
  }
}
