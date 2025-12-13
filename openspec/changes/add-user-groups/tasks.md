## 1. API Implementation

- [x] 1.1 Design database schema for `Group` table and user-group join table (many-to-many) without affecting existing user records.
- [x] 1.2 Add TypeORM entities for `Group` and the user-group join relationship, including created/updated timestamps.
- [x] 1.3 Create database migration(s) to add the new tables and indexes.
- [x] 1.4 Implement a new NestJS `GroupsModule` with controller, service, and DTOs.
- [x] 1.5 Add admin-only endpoints:
  - [x] `GET /groups` – list groups.
  - [x] `POST /groups` – create group.
  - [x] `GET /groups/:id` – get group details.
  - [x] `PUT /groups/:id` – update group (name, description, active flag).
  - [x] `DELETE /groups/:id` – delete group and its memberships.
  - [x] `GET /groups/:id/users` – list users in a group.
  - [x] `POST /groups/:id/users` – add users to group (accepts `userIds[]`).
  - [x] `DELETE /groups/:id/users/:userId` – remove a user from group.
- [x] 1.6 Enforce RBAC with `JwtAuthGuard`, `RolesGuard`, and `@Roles('admin')` on all mutating endpoints; allow only admins to manage groups.
- [x] 1.7 Add basic unit/e2e tests for the groups API: CRUD, membership operations, and permission checks.

## 2. Web Implementation

- [x] 2.1 Add a new admin-only navigation item in the sidebar for "Groups" (or localized label) visible only to `admin` users.
- [x] 2.2 Implement a Group List page:
  - [x] Fetch and display groups (name, description, active, member count).
  - [x] Provide "Create group" and "Edit" actions.
- [x] 2.3 Implement Create/Edit Group UI:
  - [x] Form for name, description, and active flag (active only on edit; default true on create).
  - [x] Client-side validation and error handling for unique name conflicts.
- [x] 2.4 Implement Group Detail / Manage Members page:
  - [x] Display group summary information.
  - [x] Show table of current members (username, full name, role).
  - [x] Provide UI to add users (multi-select or modal listing users not in the group) and remove users.
- [x] 2.5 Integrate API client calls for all group and membership operations with loading/error states.

## 3. Validation & Integration

- [x] 3.1 Ensure existing flows (login, user management, apps, app builder) remain unchanged when no groups are used.
- [x] 3.2 Run API and web builds, and relevant tests, to confirm no regressions.
- [ ] 3.3 Update any relevant README or admin documentation to mention the new "User Groups" feature and how to enable and use it (if required).

## 4. Remaining Tasks (Optional Enhancements)

- [ ] 4.1 Add E2E tests for the groups API endpoints
- [ ] 4.2 Add search/filter functionality to the groups list
- [ ] 4.3 Consider internationalization for the Chinese UI text
- [ ] 4.4 Add bulk operations for groups (create/delete multiple)
- [ ] 4.5 Add export functionality for group membership lists
