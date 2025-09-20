import { and as drizzleAnd, or as drizzleOr, not as drizzleNot, eq as drizzleEq, 
  ne as drizzleNe, gt as drizzleGt, gte as drizzleGte, lt as drizzleLt, 
  lte as drizzleLte, like as drizzleLike, inArray as drizzleIn, 
  between as drizzleBetween, isNull as drizzleIsNull, 
  isNotNull as drizzleIsNotNull, asc as drizzleAsc, 
  desc as drizzleDesc, SQL, sql } from 'drizzle-orm';
import { AnyCondition, ColumnRef } from '../types';
import IQueryTranformer from '../IQueryTransformer';

export class DrizzleQueryTransformer implements IQueryTranformer{
  
  async transformAsync<TResult>(condition: AnyCondition): Promise<TResult> {
    return this.transform(condition);
  }

  transform<TResult>(condition: AnyCondition): TResult {
    if(!condition) return null;
    
    switch (condition.type) {
      case 'eq':
        return this.transformEq(condition) as TResult;
      case 'ne':
        return this.transformNe(condition) as TResult;
      case 'gt':
        return this.transformGt(condition) as TResult;
      case 'gte':
        return this.transformGte(condition) as TResult;
      case 'lt':
        return this.transformLt(condition) as TResult;
      case 'lte':
        return this.transformLte(condition) as TResult;
      case 'like':
        return this.transformLike(condition) as TResult;
      case 'in':
        return this.transformIn(condition) as TResult;
      case 'isNull':
        return this.transformIsNull(condition) as TResult;
      case 'isNotNull':
        return this.transformIsNotNull(condition) as TResult;
      case 'between':
        return this.transformBetween(condition) as TResult;
      case 'and':
        return this.transformAnd(condition) as TResult;
      case 'or':
        return this.transformOr(condition) as TResult;
      case 'not':
        return this.transformNot(condition) as TResult;
      case 'asc':
        return this.transformAsc(condition) as TResult;
      case 'desc':
        return this.transformDesc(condition) as TResult;
      default:
        throw new Error(`Unsupported condition type: ${(condition as any).type}`);
    }
  }

  /**
   * Transform multiple conditions (for WHERE clauses)
   */
  // transformWhere(conditions: AnyCondition[]): SQL | null {
  //   if (conditions.length === 0) return null;
  //   if (conditions.length === 1) return this.transform(conditions[0]);
    
  //   const drizzleConditions = conditions.map(cond => this.transform(cond));
  //   return drizzleAnd(...drizzleConditions);
  // }

  /**
   * Transform order by conditions
   */
  // transformOrderBy(conditions: (AnyCondition & { type: 'asc' | 'desc' })[]): SQL[] {
  //   return conditions.map(cond => this.transform(cond));
  // }

  private transformColumnRef(column: ColumnRef): SQL {
    if (typeof column === 'string') {
      // Use sql.raw for column names to ensure they're properly formatted
      return sql.raw(`\`${column}\``);
    }
    return column;
  }

  private transformEq(condition: AnyCondition & { type: 'eq' }): SQL {
    return drizzleEq(
      this.transformColumnRef(condition.column),
      condition.value
    );
  }

  private transformNe(condition: AnyCondition & { type: 'ne' }): SQL {
    return drizzleNe(
      this.transformColumnRef(condition.column),
      condition.value
    );
  }

  private transformGt(condition: AnyCondition & { type: 'gt' }): SQL {
    return drizzleGt(
      this.transformColumnRef(condition.column),
      condition.value
    );
  }

  private transformGte(condition: AnyCondition & { type: 'gte' }): SQL {
    return drizzleGte(
      this.transformColumnRef(condition.column),
      condition.value
    );
  }

  private transformLt(condition: AnyCondition & { type: 'lt' }): SQL {
    return drizzleLt(
      this.transformColumnRef(condition.column),
      condition.value
    );
  }

  private transformLte(condition: AnyCondition & { type: 'lte' }): SQL {
    return drizzleLte(
      this.transformColumnRef(condition.column),
      condition.value
    );
  }

  private transformLike(condition: AnyCondition & { type: 'like' }): SQL {
    return drizzleLike(
      this.transformColumnRef(condition.column),
      `%${condition.value}%`
    );
  }

  private transformIn(condition: AnyCondition & { type: 'in' }): SQL {
    return drizzleIn(
      this.transformColumnRef(condition.column),
      condition.values
    );
  }

  private transformIsNull(condition: AnyCondition & { type: 'isNull' }): SQL {
    return drizzleIsNull(this.transformColumnRef(condition.column));
  }

  private transformIsNotNull(condition: AnyCondition & { type: 'isNotNull' }): SQL {
    return drizzleIsNotNull(this.transformColumnRef(condition.column));
  }

  private transformBetween(condition: AnyCondition & { type: 'between' }): SQL {
    return drizzleBetween(
      this.transformColumnRef(condition.column),
      condition.start,
      condition.end
    );
  }

  private transformAnd(condition: AnyCondition & { type: 'and' }): SQL {
    const drizzleConditions : SQL[] = condition.conditions.map(cond => this.transform(cond as unknown as AnyCondition));
    return drizzleAnd(...drizzleConditions);
  }

  private transformOr(condition: AnyCondition & { type: 'or' }): SQL {
    const drizzleConditions : SQL[] = condition.conditions.map(cond => this.transform(cond as unknown as AnyCondition));
    return drizzleOr(...drizzleConditions);
  }

  private transformNot(condition: AnyCondition & { type: 'not' }): SQL {
    //return drizzleNot(this.transform(condition));
    return drizzleNot(this.transform(condition.condition as AnyCondition));
  }

  private transformAsc(condition: AnyCondition & { type: 'asc' }): SQL {
    return drizzleAsc(this.transformColumnRef(condition.column));
  }

  private transformDesc(condition: AnyCondition & { type: 'desc' }): SQL {
    return drizzleDesc(this.transformColumnRef(condition.column));
  }
}