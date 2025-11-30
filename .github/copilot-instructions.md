# Project Instructions

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Auth**: NextAuth.js v5

## Architecture & Configuration

### Database (TypeORM)
- **Configuration**: `src/lib/database.ts`
- **Synchronization**: `synchronize: true` is enabled. The database schema automatically syncs with entity changes. **Do not create manual migrations** unless specifically required.
- **Entities**: All database entities are defined in `src/entities/`.
- **Usage**: Always use the `getDataSource()` helper from `src/lib/database.ts` to ensure a single active connection.

### Authentication
- **Provider**: NextAuth.js v5
- **Config**: `src/lib/auth.ts` and `src/lib/auth.config.ts`
- **Middleware**: `src/middleware.ts` handles session verification and route protection.

### UI & Styling
- **Components**: Radix UI primitives (shadcn/ui) are used in `src/components/ui`.
- **Icons**: Use `lucide-react`.
- **Styling**: Use Tailwind CSS utility classes. Avoid custom CSS files where possible.

## Coding Guidelines
- **Components**: Use React Functional Components with TypeScript interfaces.
- **Server vs Client**: Prefer Server Components for initial data fetching. Use `'use client'` only when interactivity (hooks, event listeners) is needed.
- **Forms**: Use `react-hook-form` combined with `zod` for schema validation.
- **API**: Use Next.js Server Actions for form submissions and mutations. Use Route Handlers (`app/api/...`) for external API endpoints.

## Directory Structure
- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/entities`: TypeORM entity definitions.
- `src/lib`: Shared utilities, configurations, and helper functions.
- `src/scripts`: Standalone scripts (runnable via `tsx`).
