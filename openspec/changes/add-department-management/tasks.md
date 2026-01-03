## 1. API & ORM Implementation

- [x] 1.1 Add `Department` TypeORM entity mapped to `TC_APP_DEPT` (fields: `deptNo`, `deptName`, `parentDeptNo`, `deptLevel`, `managerId`, `active`, `createdAt`, `updatedAt`).
- [x] 1.2 Register `Department` in the shared Core/Users module so its repository can be injected where needed.
- [x] 1.3 Implement Department service and controller endpoints for listing, creating, updating, and toggling `active` (soft delete) using ORM queries.
- [x] 1.4 Apply role-based guards so only `admin` and `manager` may modify departments; non-privileged users receive 403.
- [x] 1.5 Replace the `ACM_FACTORY_DEPT` stored procedure usage in `UsersService.getFactoryDepartments` with a TypeORM-based query against `Department`, returning a neutral `DepartmentDto` shape (`deptNo`, `deptName`) and only active departments.

## 2. Web UI Implementation

- [x] 2.1 Add a "Departments" submenu item under the Users section in the sidebar, routed to a new Departments management page.
- [x] 2.2 Ensure the Departments page is only visible and accessible for `admin` and `manager` roles (both in the UI and via API guards).
- [x] 2.3 Implement a table + form UI for Department management (list, create, edit basic fields, toggle active) powered by the new Department API.
- [x] 2.4 Update the create-user form to fetch available departments from the Department API (e.g., `GET /users/departments`) instead of the stored procedure-backed list; show only active departments.

## 3. Validation & Compatibility

- [x] 3.1 Add or update backend tests to cover Department entity mapping, RBAC on Department endpoints, and the new `getFactoryDepartments` behavior.
- [x] 3.2 Add or update frontend tests (or manual checks) to verify the Departments page is only available to admin/manager and that user creation still succeeds with selected departments.
- [x] 3.3 Verify dashboard department counts remain consistent or document any differences if they switch to using the Department entity in follow-up work.
