# Proposal: Refactor to Minimal Core

## Problem

The ACM monorepo has accumulated modules that are not needed for the core functionality:
- **Groups** - User group management with memberships
- **Documents** - Document lifecycle with stages and Office integration
- **Mobile Apps** - Mobile app registry and login tracking
- **App Builder** - CI/CD-like mobile app build pipeline

The User entity has grown to 15+ fields including departments, manager hierarchy, and sign levels that are no longer required.

## Solution

Refactor to a minimal core with three modules only:
- **AUTH** - JWT authentication (keep existing)
- **USERS** - Simplified user CRUD
- **DASHBOARD** - Minimal welcome page

Simplify User entity to 7 fields:
- `id`, `username`, `password`, `fullName`, `role`, `createdAt`, `updatedAt`

## Changes

### Backend (apps/api)

**BREAKING** - Remove modules:
- `src/groups/` - Delete entirely
- `src/documents/` - Delete entirely
- `src/mobile-apps/` - Delete entirely
- `src/app-builder/` - Delete entirely
- `src/minio/` - Delete entirely (MinIO storage no longer needed)

**BREAKING** - Simplify User entity:
- Remove fields: `deptNo`, `deptName`, `managerId`, `signLevel`, `email`, `isActive`, `lastLoginAt`
- Keep fields: `id`, `username`, `password`, `fullName`, `role`, `createdAt`, `updatedAt`
- Simplify roles: Remove `manager` role, keep only `admin` and `user`

**BREAKING** - Simplify Auth:
- Remove manager role from guards and strategies
- Keep JWT authentication with Passport

**BREAKING** - Rewrite Dashboard:
- Remove mobile apps dependency
- Show welcome message, quick links, current user info

### Frontend (apps/web)

**BREAKING** - Remove features:
- `features/groups/` - Delete
- `features/documents/` - Delete
- `features/apps/` - Delete
- `features/app-builder/` - Delete

**BREAKING** - Remove routes:
- All `/groups/*` routes
- All `/documents/*` routes
- All `/apps/*` routes
- All `/app-builder/*` routes
- `/departments/*` routes

**BREAKING** - Remove departments:
- `features/users/departments*` - Delete
- Department-related UI components

### Dependencies

**BREAKING** - Remove packages:
- `@onlyoffice/document-editor-react`
- `socket.io` and `@nestjs/websockets`
- `minio`
- `multer`

## Capabilities

### New Capabilities

- `user-auth`: JWT authentication with admin/user roles
- `user-management`: CRUD operations for simplified user entity
- `dashboard`: Minimal dashboard with welcome message and quick links

### Modified Capabilities

None (no existing specs to modify)

## Impact

### Database
- **MSSQL**: Keep existing database
- **Migration required**: Alter `TC_APP_ACCOUNT` table to remove unused columns
- **Data migration**: Null out or remove data from deprecated columns

### API
- Remove 4 module directories (~50+ files)
- Remove MinIO integration
- Remove WebSocket support
- Simplify auth guards

### Frontend
- Remove 4 feature directories
- Remove ~30 route files
- Simplify user forms (remove department, manager, sign level fields)

### Dependencies
- Remove MinIO, Socket.io, OnlyOffice, Multer packages
- Estimated: 4-6 packages removed
