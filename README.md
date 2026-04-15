# Mono-Core

A full-stack monorepo starter template for building enterprise web applications. Ships with authentication, user management, and a dashboard — providing a well-architected base that teams extend with domain-specific features.

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| **Monorepo**     | pnpm workspaces + Turborepo         |
| **Backend**      | NestJS 11 + Express                 |
| **Database**     | Microsoft SQL Server (MSSQL)        |
| **ORM**          | TypeORM 0.3                         |
| **Auth**         | Passport.js + JWT                   |
| **Frontend**     | React 19 + Vite 7                   |
| **Routing**      | TanStack Router (file-based)        |
| **Server State** | TanStack Query v5                   |
| **Client State** | Zustand v5                          |
| **UI**           | shadcn/ui + Radix + Tailwind CSS v4 |
| **Containers**   | Docker + Docker Compose             |

## Project Structure

```
mono-core/
├── apps/
│   ├── api/                    # NestJS backend
│   │   └── src/
│   │       ├── auth/           # Authentication module (JWT + Local strategy)
│   │       ├── users/          # User management module
│   │       ├── dashboard/      # Dashboard module
│   │       ├── core/           # Shared TypeORM module
│   │       ├── database/       # Database configuration
│   │       ├── seeds/          # Seed data
│   │       └── migrations/     # Database migrations
│   └── web/                    # React frontend
│       └── src/
│           ├── routes/         # File-based routing (TanStack Router)
│           ├── features/       # Feature-based organization
│           │   ├── auth/       #   Auth hooks, store, components
│           │   ├── users/      #   User management hooks, components
│           │   └── dashboard/  #   Dashboard hooks, components
│           ├── components/     # Shared UI components (shadcn/ui)
│           ├── lib/            # Utilities, API client, services
│           └── store/          # Global Zustand stores
├── packages/
│   ├── api/                    # Shared entities + DTOs (single source of truth)
│   ├── eslint-config/          # Shared ESLint v9 flat configs
│   ├── jest-config/            # Shared Jest presets
│   └── typescript-config/      # Shared TypeScript configs
├── openspec/
│   └── specs/                  # Project specifications
└── scripts/                    # Build and deployment scripts
```

## Features

- **JWT Authentication** — Access + refresh tokens with role-based access control
- **User Management** — CRUD operations with paginated listing, search, and role hierarchy
- **Dashboard** — Statistics cards and activity feed
- **Three-tier Roles** — `admin` > `manager` > `user` with fine-grained permissions
- **Database Migrations** — TypeORM migration system
- **Seed Data** — Pre-configured admin/manager/user accounts
- **Docker** — Multi-stage builds with Nginx reverse proxy
- **Health Checks** — Both API and web services monitored

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm 8.15+
- Microsoft SQL Server

### Installation

```bash
pnpm install
```

### Environment Setup

Copy the example env file and configure:

```bash
cp apps/api/.env.example apps/api/.env
```

Required variables:

```env
DB_HOST=your_database_host
DB_PORT=1433
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=MonoCore
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=24h
CORS_ORIGINS=http://localhost:5173
```

### Development

```bash
pnpm dev
```

- API runs on `http://localhost:3000`
- Web runs on `http://localhost:5173` (proxies `/api` to the API)

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Database Migrations

```bash
pnpm --filter mono-core-api run migration:run
```

### Seed Data

After running migrations, seed with default users:

| Username  | Password  | Role    |
| --------- | --------- | ------- |
| `admin`   | `nimda`   | admin   |
| `manager` | `manager` | manager |
| `user`    | `user`    | user    |

## Docker

### Build and Run

```bash
pnpm docker:build
pnpm docker:up
```

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser     │────▶│    Nginx     │────▶│   NestJS     │
│               │     │   (:80)      │     │   (:3000)    │
│               │     │              │     │              │
│               │     │ /api  ───────┼────▶│ REST API     │
│               │     │ /*    ───────┼─┐   │              │
│               │     │              │ │   │ TypeORM      │
│               │     └──────────────┘ │   │      │       │
│               │                      │   │      ▼       │
│               │◄─────────────────────┘   │  SQL Server  │
└──────────────┘                          └──────────────┘
```

## API Endpoints

### Public

| Method | Route                   | Description        |
| ------ | ----------------------- | ------------------ |
| `GET`  | `/api/health`           | Health check       |
| `POST` | `/api/auth/create-user` | Register user      |
| `POST` | `/api/auth/login`       | Login → JWT tokens |

### Authenticated

| Method   | Route                       | Description            |
| -------- | --------------------------- | ---------------------- |
| `POST`   | `/api/auth/refresh`         | Refresh access token   |
| `GET`    | `/api/auth/profile`         | Current user profile   |
| `POST`   | `/api/auth/change-password` | Change password        |
| `GET`    | `/api/users`                | List users (paginated) |
| `POST`   | `/api/users`                | Create user            |
| `GET`    | `/api/users/search`         | Search users           |
| `GET`    | `/api/users/profile`        | Own profile            |
| `PUT`    | `/api/users/profile`        | Update own profile     |
| `GET`    | `/api/users/:id`            | Get user by ID         |
| `PUT`    | `/api/users/:id`            | Update user            |
| `DELETE` | `/api/users/:id`            | Delete user            |
| `GET`    | `/api/dashboard/stats`      | Dashboard statistics   |
| `GET`    | `/api/dashboard/activity`   | Activity feed          |

## Frontend Routes

| Path                | Access        | Description        |
| ------------------- | ------------- | ------------------ |
| `/login`            | Public        | Login page         |
| `/dashboard`        | Authenticated | Dashboard overview |
| `/settings/profile` | Authenticated | Profile editing    |
| `/settings/account` | Authenticated | Password settings  |
| `/users`            | Admin/Manager | User management    |
| `/users/create`     | Admin/Manager | Create user        |
| `/users/:id/view`   | Admin/Manager | View user          |
| `/users/:id/edit`   | Admin/Manager | Edit user          |

## Role Permissions

| Permission               | Admin | Manager | User |
| ------------------------ | ----- | ------- | ---- |
| Create users (any role)  | ✓     | —       | —    |
| Create users (user role) | ✓     | ✓       | —    |
| Edit users               | ✓     | ✓       | —    |
| Delete users (any)       | ✓     | —       | —    |
| Delete users (user role) | ✓     | ✓       | —    |
| Edit roles               | ✓     | —       | —    |
| Access user management   | ✓     | ✓       | —    |

## Extending

The template is designed to be extended:

1. **Add a backend module** — Create a new directory in `apps/api/src/` with a NestJS module
2. **Add shared types** — Add entities and DTOs to `packages/api/src/` and update `entry.ts`
3. **Add a frontend feature** — Create a feature folder in `apps/web/src/features/` with `types/`, `hooks/`, `components/`
4. **Add a route** — Add a file in `apps/web/src/routes/` (TanStack Router auto-discovers it)
5. **Add UI components** — Use `npx shadcn@latest add <component>` in the web app

## License

Private — All rights reserved.
