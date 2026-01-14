## ADDED Requirements

### Requirement: Department Entity And ORM Access

The system SHALL expose departments as a first-class ORM entity mapped to the existing `TC_APP_DEPT` table for reuse across the User Management domain.

- The `Department` entity SHALL map the following columns: `dept_no` → `deptNo`, `dept_name` → `deptName`, `parent_dept_no` → `parentDeptNo`, `dept_level` → `deptLevel`, `manager_id` → `managerId`, `active` → `active`, `created_at` → `createdAt`, `updated_at` → `updatedAt`.
- The `dept_no` field SHALL be treated as the primary identifier for a department and MUST be unique and non-empty.
- The `active` flag SHALL indicate whether a department is selectable for new users and visible by default in user-facing lists.
- The Department repository SHALL be injectable via the shared Core/Users module so other services (e.g., dashboard) MAY query departments using ORM instead of raw SQL or stored procedures.

#### Scenario: Load departments via ORM

- WHEN a service in the Users domain needs the list of departments
- THEN it SHALL query the `Department` entity (via TypeORM) instead of relying on a stored procedure for read operations.

### Requirement: Department Management API And RBAC

The system SHALL provide API endpoints to manage departments via the `Department` entity with role-based access control.

- The API SHALL expose endpoints under `/departments` (or an equivalent `/users/departments` namespace) to list, create, update, and toggle the `active` status of departments.
- Only users with role `admin` or `manager` SHALL be allowed to create, update, or toggle the `active` status of departments.
- Non-privileged users (role `user`) attempting to modify departments SHALL receive `403 Forbidden`.
- Listing departments MAY be available to all authenticated users, but the default behavior for management UI and user creation SHALL rely on active departments only.
- The API SHALL perform validation to ensure `deptNo` uniqueness and non-empty `deptName` when creating or updating departments.

#### Scenario: Admin manages departments

- WHEN a user with role `admin` calls the Department management endpoints
- THEN they SHALL be able to create new departments, update existing department metadata (including hierarchy and manager), and toggle the `active` flag without database-level errors.

#### Scenario: Unauthorized department modification blocked

- WHEN a user with role `user` attempts to create, update, or toggle the `active` status of a department
- THEN the API SHALL respond with `403 Forbidden` and SHALL NOT modify any department data.

### Requirement: Department Selection For User Creation

The system SHALL use the `Department` entity as the canonical source of departments when creating users, replacing stored-procedure-based department lists.

- The endpoint used by the create-user flow to fetch departments (e.g., `GET /users/departments`) SHALL return departments loaded via the `Department` entity, limited to entries where `active = 1`.
- The response shape for department selection SHALL use a neutral `DepartmentDto` (`deptNo`, `deptName`) so the frontend can consume department options without the "Factory" prefix in naming.
- The create-user form in the web UI SHALL populate the department dropdown from this Department-based endpoint and SHALL only allow selecting active departments.
- The system SHALL NOT call the `ACM_FACTORY_DEPT` stored procedure as part of the create-user flow after this change; ORM-based queries against `Department` SHALL be used instead.

#### Scenario: Create user with Department-based list

- WHEN an admin or manager opens the create-user form
- THEN the UI fetches available departments from the Department-based endpoint and shows only active departments for selection
- AND when a department is selected, the user record is created with `deptNo` and `deptName` corresponding to the chosen `Department`.

### Requirement: Departments Sidebar Navigation

The web application SHALL provide a Departments management page accessible from the Users sidebar section for privileged roles.

- The sidebar under the authenticated layout SHALL include a "Departments" submenu item grouped with other User Management links.
- Only users with role `admin` or `manager` SHALL see and access the Departments submenu and page; users with role `user` SHALL NOT see this navigation entry.
- The Departments page SHALL display a list of departments (including `deptNo`, `deptName`, hierarchy/level, active flag) and basic actions to create, edit, and toggle active status.
- The Departments UI SHALL surface API errors (e.g., permission denied) in a user-friendly way without breaking the rest of the Users section.

#### Scenario: Sidebar visibility by role

- WHEN an `admin` or `manager` user views the authenticated sidebar
- THEN the Users section SHALL include a "Departments" submenu item that navigates to the Departments management page.

#### Scenario: Regular user cannot access Departments

- WHEN a `user`-role account is logged in
- THEN the Departments submenu SHALL not appear in the sidebar
- AND direct navigation to the Departments route SHALL be blocked by frontend routing or API guards, resulting in an appropriate error (e.g., 403 or redirect).
