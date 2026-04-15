# Mono-Core — Main Specification

## Identity

| Field       | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| **Name**    | Mono-Core                                                      |
| **Version** | 0.1.0                                                          |
| **Type**    | Reusable core starter template for enterprise web applications |
| **Locale**  | Traditional Chinese (zh-Hant), Asia/Taipei timezone (UTC+8)    |
| **License** | Unlicensed (private)                                           |

## Purpose

Mono-Core is a full-stack monorepo starter template that provides the foundational infrastructure for building enterprise-grade applications. It ships with authentication, user management, and a dashboard out of the box — providing a well-architected base that teams extend with domain-specific features.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Mono-Core Monorepo                               │
│                    (pnpm workspaces + Turborepo)                         │
├─────────────────────────────────┬───────────────────────────────────────┤
│                                 │                                       │
│   ┌─────────────────────────┐   │   ┌─────────────────────────────┐    │
│   │    apps/api              │   │   │    apps/web                  │    │
│   │    NestJS 11 + Express   │   │   │    React 19 + Vite 7        │    │
│   │                          │   │   │                              │    │
│   │  ┌─────┐ ┌──────┐       │   │   │  ┌────────────────────┐     │    │
│   │  │Auth │ │Users │       │   │   │  │ TanStack Router     │     │    │
│   │  │Module│ │Module│       │◄──┼───│──│─ (file-based)       │     │    │
│   │  └─────┘ └──────┘       │JWT│   │  ├────────────────────┤     │    │
│   │  ┌─────┐ ┌──────┐       │   │   │  │ TanStack Query v5  │     │    │
│   │  │Dash │ │Core  │       │   │   │  │ (server state)      │     │    │
│   │  │board│ │Module│       │   │   │  ├────────────────────┤     │    │
│   │  └─────┘ └──────┘       │   │   │  │ Zustand v5          │     │    │
│   │          │               │   │   │  │ (client state)      │     │    │
│   │          ▼               │   │   │  ├────────────────────┤     │    │
│   │  ┌─────────────────┐     │   │   │  │ shadcn/ui + Radix  │     │    │
│   │  │ TypeORM 0.3.27  │     │   │   │  │ (component library) │     │    │
│   │  │ Microsoft SQL   │     │   │   │  ├────────────────────┤     │    │
│   │  │ Server (MSSQL)  │     │   │   │  │ Tailwind CSS v4     │     │    │
│   │  └─────────────────┘     │   │   │  └────────────────────┘     │    │
│   └─────────────────────────┘   │   └─────────────────────────────┘    │
│                                  │                                      │
│         ┌────────────────────────┴──────────────────────────┐          │
│         │                 packages/ (shared)                 │          │
│         │  @repo/api            @repo/eslint-config          │          │
│         │  (entities, DTOs)    (ESLint v9 flat config)       │          │
│         │  @repo/jest-config    @repo/typescript-config      │          │
│         │  (Jest presets)      (TS config inheritance)       │          │
│         └────────────────────────────────────────────────────┘          │
│                                                                         │
│         ┌────────────────────────────────────────────────────┐          │
│         │              Infrastructure                         │          │
│         │  Docker (multi-stage) + Docker Compose              │          │
│         │  Nginx reverse proxy (production)                   │          │
│         │  Health checks on both services                     │          │
│         └────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Design Decisions

| Decision               | Choice                                | Rationale                                                     |
| ---------------------- | ------------------------------------- | ------------------------------------------------------------- |
| **Monorepo tooling**   | pnpm workspaces + Turborepo           | Fast builds, proper dependency hoisting, shared configs       |
| **Backend framework**  | NestJS v11 + Express                  | Modular architecture, decorator-based DI, enterprise patterns |
| **Database**           | Microsoft SQL Server only             | Enterprise requirement; TypeORM provides abstraction          |
| **ORM**                | TypeORM 0.3.27                        | Decorator-based, migration support, SQL Server support        |
| **Auth strategy**      | Passport + JWT (stateful)             | Industry standard, stateful JWT allows immediate revocation   |
| **Password hashing**   | bcrypt (always on)                    | Industry standard, no conditional toggles                     |
| **ID generation**      | nanoid with prefixed IDs              | Collision-resistant, URL-safe, human-readable prefixes        |
| **Frontend framework** | React 19 + Vite 7                     | Latest concurrent features, fast HMR                          |
| **Routing**            | TanStack Router (file-based)          | Type-safe, code splitting, built-in auth guards               |
| **Server state**       | TanStack Query v5                     | Caching, background refetching, optimistic updates            |
| **Client state**       | Zustand v5 + persist middleware       | Lightweight, no boilerplate, localStorage sync                |
| **UI library**         | shadcn/ui (New York) + Radix          | Copy-paste components, accessible, fully customizable         |
| **CSS**                | Tailwind CSS v4                       | Utility-first, CSS-native config, oklch color space           |
| **Validation**         | class-validator (API) + Zod (Web)     | Each ecosystem's standard                                     |
| **Locale**             | Traditional Chinese (zh-Hant)         | Hardcoded strings, Asia/Taipei timezone                       |
| **Containers**         | Docker multi-stage + Compose          | Reproducible builds, one-command deployment                   |
| **Production serving** | Nginx                                 | Static files, API proxy, gzip, security headers               |
| **Shared types**       | @repo/api workspace package           | Single source of truth for entities and DTOs                  |
| **Config sharing**     | @repo/{eslint,jest,typescript}-config | Consistent tooling across monorepo                            |

## Capability Domains

### 1. Authentication

- JWT access tokens (60 min) + refresh tokens (7 days)
- Local strategy login (username/password)
- Token refresh flow
- Role-based access control (admin / manager / user)
- Password management (bcrypt always on)
- Session lifecycle management

### 2. User Management

- CRUD operations (role-gated by admin/manager)
- Paginated listing with filters
- User search
- Self-profile viewing and editing
- Self-password change
- Three-tier role hierarchy: admin (3) > manager (2) > user (1)

### 3. Dashboard

- User statistics (total count, admin count)
- Recent activity feed
- Extensible layout for adding widgets

### 4. Shared Domain

- `@repo/api` — entities and DTOs consumed by both apps
- Shared ESLint, Jest, and TypeScript configurations

### 5. Infrastructure

- Docker multi-stage builds (API: Node Alpine, Web: Node → Nginx)
- Docker Compose orchestration with health checks
- Nginx reverse proxy (production)
- Database migrations via TypeORM
- Seed data (admin/manager/user)

## Data Model

### ACCOUNT (User)

| Column    | Type         | Constraints              | Notes                      |
| --------- | ------------ | ------------------------ | -------------------------- |
| id        | nvarchar(50) | PRIMARY KEY              | nanoid with `user_` prefix |
| username  | nvarchar     | UNIQUE, NOT NULL         | Login identifier           |
| password  | nvarchar     | NOT NULL                 | bcrypt hashed              |
| fullName  | nvarchar     | NOT NULL                 | Display name               |
| role      | nvarchar     | NOT NULL, default 'user' | admin / manager / user     |
| createdAt | datetime2    | Auto-generated           |                            |
| updatedAt | datetime2    | Auto-updated             |                            |

### ACCOUNT_LOGIN (Login History)

| Column     | Type             | Constraints              | Notes               |
| ---------- | ---------------- | ------------------------ | ------------------- |
| id         | uniqueidentifier | PRIMARY KEY              | Auto-generated UUID |
| account_id | nvarchar(50)     | FOREIGN KEY → ACCOUNT.id |                     |
| loginAt    | datetime         | Auto-generated           |                     |

## API Surface

All routes prefixed with `/api`.

### Public

| Method | Route               | Description                                             |
| ------ | ------------------- | ------------------------------------------------------- |
| GET    | `/`                 | Redirects to `/api/health`                              |
| GET    | `/health`           | Health check (status, version, uptime, UTC+8 timestamp) |
| POST   | `/auth/create-user` | Register a new user                                     |
| POST   | `/auth/login`       | Authenticate and receive JWT tokens                     |

### Authenticated (JWT required)

| Method | Route                    | Description                                  |
| ------ | ------------------------ | -------------------------------------------- |
| POST   | `/auth/refresh`          | Refresh access token                         |
| GET    | `/auth/profile`          | Current user profile                         |
| POST   | `/auth/change-password`  | Change password                              |
| GET    | `/users`                 | List users (paginated, filtered, role-gated) |
| POST   | `/users`                 | Create user (admin/manager)                  |
| GET    | `/users/search`          | Search users by query                        |
| GET    | `/users/profile`         | Own profile                                  |
| PUT    | `/users/profile`         | Update own profile                           |
| PUT    | `/users/change-password` | Change own password                          |
| GET    | `/users/:id`             | Get user by ID                               |
| PUT    | `/users/:id`             | Update user (admin/manager)                  |
| DELETE | `/users/:id`             | Delete user (admin only)                     |
| GET    | `/dashboard/stats`       | Dashboard statistics                         |
| GET    | `/dashboard/activity`    | Recent activity feed                         |

## Frontend Route Map

| Path                | Access        | Description                 |
| ------------------- | ------------- | --------------------------- |
| `/`                 | Public        | Redirects to `/dashboard`   |
| `/login`            | Public        | Login page                  |
| `/unauthorized`     | Public        | Access denied page          |
| `/dashboard`        | Authenticated | Dashboard overview          |
| `/settings/profile` | Authenticated | User profile editing        |
| `/settings/account` | Authenticated | Account + password settings |
| `/users`            | Admin         | Users management layout     |
| `/users/`           | Admin         | User list (data table)      |
| `/users/create`     | Admin         | Create new user             |
| `/users/:id/view`   | Admin         | View user detail            |
| `/users/:id/edit`   | Admin         | Edit user                   |

## Extension Points

The template is designed to be extended with domain-specific features.

### Backend (`apps/api/src/`)

- New NestJS modules as directories
- Entities added to `@repo/api` or local `entities/` folders
- Migrations via TypeORM CLI
- Guards and decorators in `auth/`
- ID generation via `IdGenerator.generateCustomId(prefix)`

### Frontend (`apps/web/src/`)

- File-based routes in `routes/`
- Feature folders with `types/`, `hooks/`, `components/`, `utils/`
- shadcn/ui components added via CLI
- Zustand stores in `store/`
- TanStack Query hooks in `features/`

### Shared (`packages/`)

- Entities and DTOs in `@repo/api`
- Config packages (`eslint-config`, `jest-config`, `typescript-config`) remain stable
