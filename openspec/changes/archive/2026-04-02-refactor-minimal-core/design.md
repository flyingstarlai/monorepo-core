## Context

The ACM monorepo currently contains 6 feature modules but only needs 3 for its core purpose. This refactoring removes unused modules while preserving the essential user management and authentication functionality.

**Current State:**
- Backend: 6 modules (auth, users, groups, documents, mobile-apps, app-builder)
- Frontend: 6 feature directories with 35+ routes
- User entity: 15+ columns including departments, manager hierarchy, sign levels
- Dependencies: MinIO, Socket.io, OnlyOffice, Multer

**Target State:**
- Backend: 3 modules (auth, users, dashboard)
- Frontend: 2 feature directories (auth, users) + dashboard route
- User entity: 7 columns (id, username, password, fullName, role, createdAt, updatedAt)
- Dependencies: Core NestJS packages only

**Constraints:**
- Must maintain backward compatibility with existing `TC_APP_ACCOUNT` table
- Keep MSSQL database
- Preserve JWT authentication

## Goals / Non-Goals

**Goals:**
- Remove groups, documents, mobile-apps, app-builder modules from backend
- Remove corresponding features and routes from frontend
- Simplify User entity to 7 essential fields
- Keep only `admin` and `user` roles (remove `manager`)
- Create minimal dashboard with welcome message and quick links
- Remove unused npm dependencies

**Non-Goals:**
- Database migration to different engine (staying with MSSQL)
- Changing authentication mechanism (staying with JWT)
- Adding new features or capabilities
- Performance optimization
- UI/UX redesign

## Decisions

### 1. User Entity Column Strategy

**Decision:** Keep existing columns in database but mark as nullable, remove from entity definition

**Rationale:** 
- Dropping columns requires data migration and potential rollback complexity
- Keeping columns nullable preserves existing data without risk
- Entity definition controls what the application uses

**Alternatives considered:**
- Drop columns entirely → Rejected: Higher risk, harder to rollback
- Create new table → Rejected: Unnecessary complexity for a simplification effort

### 2. Role Simplification

**Decision:** Keep `role` column but only support `admin` and `user` values

**Rationale:**
- Existing `manager` role can be migrated to `user` or `admin` based on needs
- Simplifies authorization logic
- Type definition updated to `'admin' | 'user'`

**Migration:** 
- Existing `manager` users → migrate to `user` role
- Update guards to check only `admin` for protected routes

### 3. Module Deletion Strategy

**Decision:** Delete modules entirely rather than feature-flagging

**Rationale:**
- These modules are not needed, not temporarily disabled
- Reduces codebase complexity and maintenance burden
- Cleaner git history with explicit deletion

**Order:**
1. Remove frontend routes and features first (no broken links)
2. Remove backend modules
3. Clean up shared packages
4. Remove npm dependencies

### 4. Dashboard Implementation

**Decision:** Static dashboard with welcome message, current user info, and quick links

**Rationale:**
- No metrics to display without mobile-apps module
- Provides navigation aid for users
- Minimal implementation effort

**Content:**
- Welcome message with user's full name
- Quick links: Users (admin only), Settings
- Current user role display

### 5. Package Removal

**Decision:** Remove packages and their usage in one pass per package

**Packages to remove:**
- `@onlyoffice/document-editor-react` → Documents feature
- `socket.io`, `@nestjs/websockets` → Real-time features
- `minio`, `@types/minio` → File storage
- `multer`, `@types/multer` → File upload

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Existing data in deprecated columns becomes inaccessible | Columns remain in DB, can be accessed if needed |
| `manager` role users lose elevated access | Audit existing managers before migration, promote to admin if needed |
| Broken imports after module deletion | Run TypeScript compiler after each phase to catch errors |
| Frontend routes 404 after feature removal | Delete routes before features to avoid broken links |
| Missing type errors in shared packages | Update `@repo/api` types alongside backend changes |

## Migration Plan

### Phase 1: Frontend Cleanup
1. Delete route files: groups, documents, apps, app-builder, departments
2. Delete feature directories: groups, documents, apps, app-builder
3. Update `__root.tsx` navigation to remove deleted links
4. Simplify user forms (remove department, manager, signLevel fields)

### Phase 2: Backend Cleanup
1. Delete module directories: groups, documents, mobile-apps, app-builder, minio
2. Update `app.module.ts` to remove deleted imports
3. Simplify User entity (remove deprecated fields)
4. Update auth guards (remove manager role)
5. Rewrite dashboard service

### Phase 3: Shared Packages
1. Update `@repo/api` - remove unused DTOs and types
2. Remove unused exports from entry.ts

### Phase 4: Dependencies
1. Remove from apps/web/package.json: onlyoffice, react-dropzone
2. Remove from apps/api/package.json: socket.io, websockets, minio, multer
3. Remove from packages/api/package.json: minio, multer types
4. Run `pnpm install` to update lockfile

### Phase 5: Database (Optional)
1. Create migration to set deprecated columns as nullable
2. Run migration in development
3. Production migration can be deferred

### Rollback Strategy
- Git revert for code changes
- Database columns remain (no data loss)
- Re-add npm packages if needed

## Open Questions

1. **Manager role migration**: Should existing `manager` users become `admin` or `user`?
   - Recommendation: Default to `user`, audit list for manual promotion

2. **Dashboard placement**: Should dashboard be at `/` or `/dashboard`?
   - Recommendation: Keep `/dashboard` as authenticated home, `/` redirects to login
