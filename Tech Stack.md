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

### MySql Database
- date/time are stored as UTC/GMT and datetime data type is used. timestamp is only valid till 2038, datetime can be used till 9999, timestamp has db conversion between locale <> UTC/GMT.