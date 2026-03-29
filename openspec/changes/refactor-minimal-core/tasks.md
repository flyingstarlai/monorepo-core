## Phase 1: Frontend Cleanup

- [x] Delete route files: groups, documents, apps, app-builder, departments
- [x] Delete feature directories: groups, documents, apps, app-builder
- [x] Update `__root.tsx` navigation to remove deleted links
- [x] Simplify user forms (remove department, manager, signLevel fields)

## Phase 2: Backend Cleanup

- [x] Delete module directories: groups, documents, mobile-apps, app-builder, minio
- [x] Update `app.module.ts` to remove deleted imports
- [x] Simplify User entity (remove deprecated fields from type definition)
- [x] Update auth guards (remove manager role)
- [x] Rewrite dashboard service (remove mobile-apps dependency)

## Phase 3: Shared Packages

- [x] Update `@repo/api` - remove unused DTOs and types
- [x] Remove unused exports from entry.ts

## Phase 4: Dependencies

- [x] Remove from apps/web/package.json: onlyoffice, react-dropzone
- [x] Remove from apps/api/package.json: socket.io, websockets, minio, multer
- [x] Remove from packages/api/package.json: minio, multer types
- [x] Run `pnpm install` to update lockfile

## Phase 5: Database Migration (Optional)

- [ ] ~~Create migration to set deprecated columns as nullable~~
- [ ] ~~Run migration in development~~
- [x] Production migration can be deferred~~

## Phase 6: Verification

- [x] Run TypeScript compiler to verify no errors
- [ ] Run linter to check for issues
- [ ] Test login/logout flow
- [ ] Test user CRUD operations
- [ ] Test dashboard renders correctly
- [ ] Verify role-based access control works
