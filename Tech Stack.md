# Tech Stack

## Application
- Base - NextJS (App Router)
- DI - Inversify
- UI - Shadcn
- ORM - Drizzle
- API - RESTful API
- User Authentication - Form + Cookie
- API Authentication - JWT
- Caching - NextJs built-in cache, fetch catching, unstable-cache
- Migration - Drizzle
- Form Validation - Zod Schema
- Hashing - Argon2

## Database
MySql
DateTime - Precision 3, UTC Time

## Testing
Unit/Integration Testing - Vitest
Component - React Testing Library
API - MSW (Mock Service Worker)
E2E - Playwright


## Tech Review
### Drizzle ORM
- Schema definition only allow one-to-one mapping, we cannot create extra property wihtout corresponding db column.
- Insert/Update of related data need to be handled manually. e.g. users.posts, reservations.customers. Drizzle doesn't automatically handle. Only supported for SELECT query.
Sub-query must be used to achieve desired result.
- If SQL style is used, 
  - For joins, you need to transform the data after query result. For example, if you retrieve user and related posts, result will include [{user1, post1}, [user1, post2]].
  - select() cannot be chained later, which will be useful if we only want to change select() between count() or different columns selection.
- If Query API style is used, 
  - we cannot project columns from sub-table as the top-level column.
  - If Limit/Offset applies to query with "Joins", it applys to all tables, not to the final result. 

### MySql Database
- date/time are stored as UTC/GMT and datetime data type is used. timestamp is only valid till 2038, datetime can be used till 9999, timestamp has db conversion between locale <> UTC/GMT.


## Notes
### Date/Time
- use locale date/time in UI
- use ISO date/time in server side, api, service, repo, db, etc.
- Javascrpt date object assumes as Local Date/Time if pass as numbers and assumes as ISO/GMT/UTC time if pass as string (ISO Format). For example new Date(2025-01-01) and new Date('2025-01-01') will give different result. But in other string format will assume as local date/time e.g. 'Jan 1, 2025'.