## Why

Admins need a simple way to logically organize users into groups without changing permissions or visibility rules. Today there is no concept of "user groups" in the system, so admins cannot label or cluster users for reporting, coordination, or future scoping features.

## What Changes

- Add a new "User Groups" capability that allows admins to create and edit groups with a name and optional description.
- Allow users to belong to multiple groups via a many-to-many relationship between users and groups.
- Restrict all group management operations (create, edit, delete, add/remove members) to `admin` role only; groups themselves DO NOT affect permissions or access control in this phase.
- Expose backend APIs in the API app (NestJS) to:
  - CRUD groups.
  - Manage membership: list users in a group, add users to a group, remove users from a group.
- Add admin-only UI in the web app to:
  - View list of groups.
  - Create/edit groups.
  - Manage group membership via a "manage members" screen per group.
- Keep existing users unassigned to any groups by default; no automatic migration or default group is created.

## Impact

- Affected specs/capabilities (conceptual):
  - `users` (user model gains a relationship to groups).
  - New `groups` capability (admin-managed logical user groupings).
- Affected code:
  - API (NestJS): new module for groups, new entities and migrations for `Group` and user-group join table, guarded admin-only endpoints.
  - Web (React/Vite): new admin-only navigation entry and pages for group list, group create/edit, and group membership management.
- Non-goals / Out of Scope (for this change):
  - No permission scoping or access control changes based on groups (e.g., managers limited to their group) — groups are metadata only.
  - No reporting or analytics based on groups.
  - No automatic assignment of existing or new users into groups.
  - No audit trail beyond standard created/updated timestamps (detailed audit can be added in a future change).

## Notes and Decisions

- Users MAY belong to multiple groups; there is no limit enforced beyond basic data constraints.
- Only `admin` users can manage groups and memberships; `manager` and `user` roles cannot change group data.
- Group names MUST be unique across the system to avoid confusion in the UI and APIs.
- Deleting a group, if implemented in this change, will remove its memberships first; users remain unaffected otherwise.
- The feature is intentionally kept minimal so it can serve as a foundation for future scoping and reporting capabilities without breaking behavior now.
