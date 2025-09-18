// types.ts
import { SQL } from 'drizzle-orm';

// Base condition types
export type ColumnRef = string;

// Comparison operators
export interface EqCondition<T = any> {
  type: 'eq';
  column: ColumnRef;
  value: T;
}

export interface NeCondition<T = any> {
  type: 'ne';
  column: ColumnRef;
  value: T;
}

export interface GtCondition<T = any> {
  type: 'gt';
  column: ColumnRef;
  value: T;
}

export interface GteCondition<T = any> {
  type: 'gte';
  column: ColumnRef;
  value: T;
}

export interface LtCondition<T = any> {
  type: 'lt';
  column: ColumnRef;
  value: T;
}

export interface LteCondition<T = any> {
  type: 'lte';
  column: ColumnRef;
  value: T;
}

export interface LikeCondition {
  type: 'like';
  column: ColumnRef;
  value: string;
}

export interface InCondition<T = any> {
  type: 'in';
  column: ColumnRef;
  values: T[];
}

export interface IsNullCondition {
  type: 'isNull';
  column: ColumnRef;
}

export interface IsNotNullCondition {
  type: 'isNotNull';
  column: ColumnRef;
}

export interface BetweenCondition<T = any> {
  type: 'between';
  column: ColumnRef;
  start: T;
  end: T;
}

// Logical operators
export interface AndCondition {
  type: 'and';
  conditions: AnyCondition[];
}

export interface OrCondition {
  type: 'or';
  conditions: AnyCondition[];
}

export interface NotCondition {
  type: 'not';
  condition: AnyCondition;
}

// Sorting
export interface AscCondition {
  type: 'asc';
  column: ColumnRef;
}

export interface DescCondition {
  type: 'desc';
  column: ColumnRef;
}

// Union type for all conditions
export type AnyCondition = 
  | EqCondition<any>
  | NeCondition<any>
  | GtCondition<any>
  | GteCondition<any>
  | LtCondition<any>
  | LteCondition<any>
  | LikeCondition
  | InCondition<any>
  | IsNullCondition
  | IsNotNullCondition
  | BetweenCondition<any>
  | AndCondition
  | OrCondition
  | NotCondition
  | AscCondition
  | DescCondition;

// Helper functions for creating conditions
export const eq = <T>(column: ColumnRef, value: T): EqCondition<T> => ({
  type: 'eq',
  column,
  value
});

export const ne = <T>(column: ColumnRef, value: T): NeCondition<T> => ({
  type: 'ne',
  column,
  value
});

export const gt = <T>(column: ColumnRef, value: T): GtCondition<T> => ({
  type: 'gt',
  column,
  value
});

export const gte = <T>(column: ColumnRef, value: T): GteCondition<T> => ({
  type: 'gte',
  column,
  value
});

export const lt = <T>(column: ColumnRef, value: T): LtCondition<T> => ({
  type: 'lt',
  column,
  value
});

export const lte = <T>(column: ColumnRef, value: T): LteCondition<T> => ({
  type: 'lte',
  column,
  value
});

export const like = (column: ColumnRef, value: string): LikeCondition => ({
  type: 'like',
  column,
  value
});

export const inList = <T>(column: ColumnRef, values: T[]): InCondition<T> => ({
  type: 'in',
  column,
  values
});

export const isNull = (column: ColumnRef): IsNullCondition => ({
  type: 'isNull',
  column
});

export const isNotNull = (column: ColumnRef): IsNotNullCondition => ({
  type: 'isNotNull',
  column
});

export const between = <T>(column: ColumnRef, start: T, end: T): BetweenCondition<T> => ({
  type: 'between',
  column,
  start,
  end
});

export const and = (...conditions: AnyCondition[]): AndCondition => ({
  type: 'and',
  conditions
});

export const or = (...conditions: AnyCondition[]): OrCondition => ({
  type: 'or',
  conditions
});

export const not = (condition: AnyCondition): NotCondition => ({
  type: 'not',
  condition
});

export const asc = (column: ColumnRef): AscCondition => ({
  type: 'asc',
  column
});

export const desc = (column: ColumnRef): DescCondition => ({
  type: 'desc',
  column
});