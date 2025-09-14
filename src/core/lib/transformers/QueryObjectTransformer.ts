import { and, sql, SQL } from "drizzle-orm";
import { queryObjectMapping } from "./QueryObjectMapping";
import IQueryObjectTranformer from "./IQueryObjectTransformer";

export default class DrizzleQueryObjectTransformer implements IQueryObjectTranformer {

    async transform<TResult>( queryParams: Record<string, any> ): Promise<TResult | null> {

        const conditions: SQL[] = [];
        const tableMapping = queryObjectMapping;
    
        for (const [key, value] of Object.entries(queryParams)) {
          // Skip undefined, null, or empty values
          if (value === undefined || value === null || value === '') {
            continue;
          }
    
          const columnName = tableMapping?.[key] ? tableMapping?.[key] : key;
    
          // Handle special suffix patterns first
          if (key.endsWith('From') || key.endsWith('Until')) {
            const baseKey = key.endsWith('From') 
              ? key.slice(0, -4) 
              : key.slice(0, -5);
            
            // Check if we have both From and Until values for range query
            const fromValue = queryParams[`${baseKey}From`];
            const toValue = queryParams[`${baseKey}Until`];
            
            // Only process if this is the "From" key or if "Until" key exists without "From"
            if (key.endsWith('From') || (key.endsWith('Until') && !fromValue)) {
              const condition = this.handleRangeCondition(
                baseKey,
                fromValue as string | number | Date,
                toValue as string | number | Date,
                columnName as string
              );
              if (condition) {
                conditions.push(condition);
              }
            }
            continue;
          }
    
          // Handle regular key-value pairs based on value type
          const condition = this.handleValueCondition(value, columnName as string);
          if (condition) {
            conditions.push(condition);
          }
        }
    
        if(conditions.length === 0 )
            return null;
        if(conditions.length === 1)
            return conditions[0] as TResult;
        return and(...conditions) as TResult;
      }
    
      /**
       * Handle range conditions (From/To values)
       */
      private handleRangeCondition(
        baseKey: string,
        fromValue: string | number | Date | undefined | null,
        toValue: string | number | Date | undefined | null,
        columnName: string
      ): SQL | null {
        // If both From and To values are provided, create a BETWEEN condition
        if (fromValue && toValue) {
          return sql`${sql.identifier(columnName)} BETWEEN ${fromValue} AND ${toValue}`;
        }
        
        // If only From value is provided, use >=
        if (fromValue) {
          return sql`${sql.identifier(columnName)} >= ${fromValue}`;
        }
        
        // If only To value is provided, use <=
        if (toValue) {
          return sql`${sql.identifier(columnName)} <= ${toValue}`;
        }
        
        return null;
      }
    
      /**
       * Handle regular value conditions based on value type
       */
      private handleValueCondition(
        value: string | number | boolean | Date,
        columnName: string
      ): SQL | null {
        // Handle Date objects
        if (value instanceof Date) {
          return sql`${sql.identifier(columnName)} = ${value}`;
        }
        
        // Handle strings with LIKE pattern
        if (typeof value === 'string') {
          return sql`(${sql.identifier(columnName)} = ${`${value}`} OR ${sql.identifier(columnName)} LIKE ${`%${value}%`})`;
        }
        
        // Handle numbers and booleans with equality
        if (typeof value === 'number' || typeof value === 'boolean') {
          return sql`${sql.identifier(columnName)} = ${value}`;
        }
        
        return null;
      }
    
      /**
       * Helper to create pagination SQL
       */
      paginate(limit: number, offset: number): SQL {
        return sql`LIMIT ${limit} OFFSET ${offset}`;
      }
    
      /**
       * Helper to create order by SQL
       */
      orderBy<TResult>(orderBy: Record<string, any>): TResult {
        return sql`${sql.identifier(orderBy.column)} ${sql.raw(orderBy.direction.toUpperCase())}` as TResult;
      }
}