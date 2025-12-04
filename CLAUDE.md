# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack application built with React frontend and Hono backend, deployed on Cloudflare Workers with D1 (SQLite) database. Uses Firebase Authentication for authentication.

## Commands

```bash
# Development
npm run dev              # Start dev server (Vite + Workers)

# Build & Deploy
npm run build            # TypeScript check + Vite build
npm run check            # Full validation (tsc + build + deploy dry-run)
npm run deploy           # Deploy to Cloudflare Workers

# Linting & Testing
npm run lint             # ESLint
npm run test             # Run vitest (all tests)
npx vitest run src/worker/domain/value-object/user/UserId/UserId.test.ts  # Single test

# Database
npm run db:gen           # Generate Drizzle migrations from schema
npm run db:migrate       # Apply migrations locally
npm run db:migrate:remote # Apply migrations to production D1
npm run db:studio        # Open Drizzle Studio (local)
npm run cf-typegen       # Generate Cloudflare bindings types
```

## Architecture

### Directory Structure
- `src/react-app/` - React frontend with TanStack Router
- `src/worker/` - Hono backend (Cloudflare Worker)
- `src/components/` - Shared UI components (shadcn/ui)
- `drizzle/` - Database migrations

### Backend (Clean Architecture)
The worker follows Domain-Driven Design with clean architecture layers:

```
src/worker/
├── controller/      # HTTP routes (Hono handlers)
├── usecase/         # Application business logic
├── domain/
│   ├── entities/    # Domain models (User)
│   └── value-object/ # Validated value types (UserId, EmailAddress, UserName)
├── infrastructure/
│   └── repository/  # Data access implementations
├── db/              # Drizzle schema
└── lib/             # Shared utilities (auth setup)
```

**Value Objects**: Use static `of()` factory for throwing validation, `tryOf()` for Result pattern. All validation uses Zod.

**Repositories**: Depend on value objects for parameters, return domain entities.

**Use Cases**: Orchestrate repositories, receive/return domain types.

### Frontend
- TanStack Router with file-based routing (`src/react-app/routes/`)
- TanStack Query for data fetching
- Hono RPC client for type-safe API calls (`src/react-app/lib/hono.ts`)
- Firebase Authentication client for authentication

### Type-Safe API Communication
Backend exports `AppType` from `src/worker/index.ts`. Frontend uses Hono's `hc<AppType>()` for fully typed API calls.

### Database
- Cloudflare D1 (SQLite) with Drizzle ORM
- Schema at `src/worker/db/schema.ts`
- Migrations stored in `drizzle/` directory

### Path Alias
`@/` maps to `./src/` across both frontend and backend.
