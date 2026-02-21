# P9G Copilot Instructions

## Architecture Overview

**P9G** is a Next.js-based room reservation management system with three-tier architecture:

- **Presentation Layer**: Next.js App Router (server + client components), Shadcn/Chakra UI components
- **Service Layer**: Business logic in injectable services (`@injectable()` via Inversify DI)
- **Data Access Layer**: Drizzle ORM repositories with domain/entity/DTO model separation

### Key Data Flow
1. API Routes → Services (via DI container) → Repositories → Drizzle ORM → MySQL
2. Date/Time Convention: **UI = locale**, **Server/API/DB = ISO UTC** (see Tech Stack.md)

## Critical Project Patterns

### 1. Naming Conventions
- **Variables**: camelCase (`myVariable`)
- **Classes/Interfaces/Components**: PascalCase (`MyService`, `IUserService`, `UserButton`)
- **Framework files**: lowercase (`page.tsx`, `route.ts`, `layout.tsx`)
- **Domain/Service files**: PascalCase (`UserService.ts`, `IUserRepository.ts`)
- **Functions**: domain + verb pattern (e.g., `userCreate()`, `userFindMany()`, `reservationUpdateById()`)

### 2. Model Separation (Critical!)
Three separate models exist for each domain entity:
- **Domain Model** (`User.ts` in `core/models/domain/`): Business logic & validation
- **Entity Model** (`UserEntity.ts` in `core/models/entity/`): DB schema mapping
- **DTO** (`SessionUser.ts` in `core/models/dto/`): API/request/response data

All models extend base classes (`DomainBase`, `EntityBase`). **Never mix these layers.**

### 3. Dependency Injection (Inversify)
- All services/repositories are `@injectable()` and registered in [dicontainer.ts](src/core/di/dicontainer.ts)
- Services receive dependencies via `@inject(TYPES.IXxxService)`
- **API routes must use** `const service = container.get<IServiceType>(TYPES.IServiceType)`
- Service methods always receive `sessionUser: SessionUser` parameter for audit trails

Example service injection:
```typescript
@injectable()
export default class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private readonly userRepository: IRepository<User>
  ) {}
}
```

### 4. Authentication & Authorization
- **User Auth**: Form-based with Next-Auth + cookie session (see `auth.config.ts`)
- **API Auth**: JWT tokens for external APIs
- **Authorization**: `ConfigAuthorizer` in [middleware.ts](src/middleware.ts) checks `/console` access
- **Session User**: Available via `const session = await auth()` in API routes/actions

### 5. API Design Pattern
1. Validate request params with Zod schemas (`pagerValidator`, `searchValidator`)
2. Extract session user for authorization
3. Call service methods (not repositories directly from routes)
4. Return standardized JSON responses with `HttpStatusCode`
5. Wrap in try-catch with `CustomError` for error handling

See [src/app/api/users/route.ts](src/app/api/users/route.ts) for template.

### 6. Repository Pattern with Drizzle
- **Base Repository**: Generic `Repository<T>` handles CRUD operations
- **Specialized Repositories**: Extend base for domain-specific queries (e.g., `ReservationRepository`)
- **Key Limitation**: Drizzle doesn't auto-handle related data inserts; use sub-queries or manual handling
- **Date/Time**: All DB columns use `datetime()` with UTC precision 3, Drizzle `{ mode: 'date' }`

### 7. Logging Convention
Use injected `LogService` or imported `ConsoleLogger`:
```typescript
import c from '@/lib/loggers/console/ConsoleLogger';
c.fs('functionName');  // function start
c.d(JSON.stringify(data));  // debug
c.fe('functionName');  // function end
c.e(error.message);    // error
```

Environment variable: `CONSOLE_LOG_LEVEL` (1=info, 2=warn, 3=error, 4=debug)

## Developer Workflows

### Run Development
```bash
cd src
npm run dev  # Starts Next.js dev server with Turbopack
```

### Database Setup
```bash
npm run auth secret  # Generate AUTH_SECRET for .env.local
npx drizzle-kit migrate  # Apply migrations
npx drizzle-kit generate --name <name>  # Create new migration
```

### Testing
```bash
npm run test:unit              # Vitest unit tests in /tests/unit
npm run test:unit:coverage     # With coverage report
npm run test:integration       # Integration tests
npm run test:e2e              # Playwright E2E (requires `npm run dev` running)
```

### Database Admin
```bash
# View MySQL data via Adminer UI
php -S localhost:8000 db/adminer-5.3.0.php
```

## Important Technical Notes

### Drizzle ORM Quirks
- **One-to-one mapping only**: Cannot add properties without DB columns
- **Manual relationship handling**: Insert/update related entities manually; not auto-handled like Prisma
- **Join limitations**: SQL style requires post-query data transformation
- **Limit/Offset with joins**: Applies to all tables, not final result set

### Date/Time Handling
- Store in MySQL as UTC datetime, precision 3
- JavaScript Date assumes **local time from numbers**, **UTC from ISO strings**
  - `new Date(2025-01-01)` ≠ `new Date('2025-01-01')`
- Use `date-fns` for locale conversions in UI

### NextAuth Session
Session user shape: `{ id, email, name, role }` — available in middleware and via `await auth()`

## References
- [Tech Stack.md](Tech%20Stack.md) — Database choices, ORM limitations, date/time philosophy
- [Conventions.md](Conventions.md) — Complete naming & style rules
- [HOWTO-TEST.md](HOWTO-TEST.md) — Test execution details
- [src/README.md](src/README.md) — Project-specific setup
