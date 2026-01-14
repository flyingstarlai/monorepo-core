# app-builder Specification

## Purpose

The App Builder capability enables users to create, manage, and build Android mobile applications. It provides a self-service interface for defining app configurations, triggering builds via Jenkins, storing artifacts in MinIO, and tracking build history. The system manages app definitions grouped by company, allowing organizations to separate apps belonging to different business entities.

## ADDED Requirements

### Requirement: App Definition Management With Company Association

The system SHALL provide CRUD operations for managing mobile app definitions with company association.

- The system SHALL expose `MobileAppDefinition` entity mapped to `TC_APP_DEFINITION` table with fields: id, app_name, app_id, app_module, server_ip, company_no, created_by, created_at, updated_at.
- The `company_no` field SHALL reference `TC_APP_COMPANY.company_no` as a foreign key and MAY be NULL for backward compatibility.
- The system SHALL provide endpoints under `/app-builder/definitions` to list, create, update, and delete app definitions.
- The list endpoint SHALL accept optional `companyNo` query parameter to filter definitions by company.
- The list endpoint without `companyNo` parameter SHALL return all definitions regardless of company.
- Only users with role `admin` or `manager` SHALL be allowed to create, update, or delete app definitions.
- When creating a definition, the `companyNo` field SHALL be required and default to "TWSBP" if not specified.
- The system SHALL validate that `appModule` exists in `TC_DASHBOARD_MODULE` table when creating or updating definitions.

#### Scenario: List all app definitions

- WHEN an authenticated user calls `GET /app-builder/definitions`
- THEN the system SHALL return all app definitions with company information included
- AND the response SHALL be ordered by creation date descending

#### Scenario: List definitions by company

- WHEN an authenticated user calls `GET /app-builder/definitions?companyNo=TWSBP`
- THEN the system SHALL return only definitions assigned to company "TWSBP"
- AND the response SHALL include company information for each definition

#### Scenario: Create app definition with company

- WHEN an admin or manager creates a new app definition with companyNo="TWSBP"
- THEN the system SHALL validate that company "TWSBP" exists
- AND create the definition with the specified company assignment
- AND return the created definition with company information

#### Scenario: Update app definition company

- WHEN an admin or manager updates an existing definition to change its company
- THEN the system SHALL validate the new company exists
- AND update the definition's company_no field
- AND return the updated definition with new company information

#### Scenario: Delete app definition

- WHEN an admin or manager deletes an app definition
- THEN the system SHALL delete the definition record
- AND all associated build records SHALL be deleted (cascade delete)

### Requirement: Company Entity And ORM Access

The system SHALL expose companies as a first-class ORM entity mapped to `TC_APP_COMPANY` table for managing app definition groupings.

- The `Company` entity SHALL map to `TC_APP_COMPANY` table with columns: company_no (PK), company_name, is_active, created_at, updated_at.
- The `company_no` field SHALL be the primary identifier for a company and MUST be unique and non-empty.
- The `is_active` flag SHALL indicate whether a company is selectable for new app definitions and visible by default in dropdowns.
- The Company repository SHALL be injectable via AppBuilder module.
- The relationship between `Company` and `MobileAppDefinition` SHALL be one-to-many (one company has many definitions).

#### Scenario: Load companies via ORM

- WHEN a service in App Builder domain needs list of companies
- THEN it SHALL query `Company` entity (via TypeORM) to retrieve available companies
- AND the results SHALL include only active companies by default

#### Scenario: One-to-many relationship

- WHEN querying a company with its related app definitions
- THEN the system SHALL return one company record
- AND include all app definitions that have `company_no` matching the company's `company_no`

### Requirement: Company Management API And RBAC

The system SHALL provide API endpoints to manage companies with role-based access control.

- The API SHALL expose endpoints under `/app-builder/companies` to list, create, update, delete, and toggle `is_active` status of companies.
- Only users with role `admin` or `manager` SHALL be allowed to create, update, delete, or toggle status of companies.
- Non-privileged users (role `user`) attempting to modify companies SHALL receive `403 Forbidden`.
- Listing companies MAY be available to all authenticated users, but default behavior for app definition creation SHALL rely on active companies only.
- The API SHALL perform validation to ensure `companyNo` uniqueness and non-empty `companyName` when creating or updating companies.
- The API SHALL NOT allow deleting a company if it has one or more app definitions assigned to it.

#### Scenario: Admin manages companies

- WHEN a user with role `admin` calls Company management endpoints
- THEN they SHALL be able to create new companies, update existing company metadata, and toggle `is_active` flag
- AND operations shall succeed without database-level errors

#### Scenario: Unauthorized company modification blocked

- WHEN a user with role `user` attempts to create, update, delete, or toggle `is_active` status of a company
- THEN API SHALL respond with `403 Forbidden`
- AND SHALL NOT modify any company data

#### Scenario: Delete company with assigned definitions blocked

- WHEN an admin attempts to delete a company that has one or more app definitions
- THEN the API SHALL respond with `400 Bad Request` or appropriate error
- AND error message SHALL indicate that company has assigned app definitions
- AND company shall NOT be deleted

#### Scenario: Toggle company active status

- WHEN an admin or manager calls `PATCH /app-builder/companies/:companyNo/toggle-active`
- THEN the system SHALL invert the company's `is_active` flag
- AND return the updated company with new status
- AND deactivated companies SHALL not appear in dropdowns for new app definitions

### Requirement: Company Filter On Definitions

The system SHALL provide a company filter on the app definitions list page to enable users to view definitions by company.

- The app builder index page SHALL display a company filter dropdown (Combobox component) next to the search input.
- The company filter SHALL include an "All Companies" option that shows definitions from all companies.
- The company filter SHALL list all active companies from the system.
- Selecting a company filter SHALL update the displayed definitions list to show only definitions assigned to that company.
- The "All Companies" option SHALL be selected by default.
- Changing the company filter SHALL not affect the search query (both filters can be active simultaneously).

#### Scenario: Filter definitions by company

- WHEN user selects company "TWSBP" from company filter dropdown
- THEN the definitions list SHALL display only definitions with companyNo="TWSBP"
- AND the search filter shall continue to work within the filtered results

#### Scenario: Show all companies

- WHEN user selects "All Companies" from company filter dropdown
- THEN the definitions list SHALL display all definitions regardless of company assignment
- AND include definitions with NULL company_no values

### Requirement: Company Assignment On Definition Forms

The system SHALL require company assignment when creating or editing app definitions.

- The create definition form SHALL include a company selection dropdown (Combobox component).
- The edit definition form SHALL include a company selection dropdown (Combobox component).
- The company dropdown SHALL list all active companies fetched from the `/app-builder/companies` endpoint.
- The company dropdown SHALL default to "TWSBP" for new definitions.
- The company field SHALL be required when creating or editing a definition.
- The company dropdown SHALL show company name as display text and company_no as value.

#### Scenario: Create definition with company selection

- WHEN an admin or manager opens the create definition form
- THEN the company dropdown SHALL be populated with all active companies
- AND "TWSBP" SHALL be selected by default
- AND user can change to another active company
- AND the form shall validate that a company is selected before submission

#### Scenario: Edit definition company

- WHEN an admin or manager edits an existing definition
- THEN the company dropdown SHALL display the currently assigned company
- AND user can change the company to another active company
- AND the form shall validate company selection before saving

### Requirement: Default Company Seeding

The system SHALL create a default company "TWSBP" and assign all existing app definitions to it during migration.

- The migration for creating `TC_APP_COMPANY` table SHALL insert a default company row with company_no='TWSBP', company_name='TWSBP', is_active=1.
- The migration for adding `company_no` column to `TC_APP_DEFINITION` SHALL update all existing definitions: `UPDATE TC_APP_DEFINITION SET company_no='TWSBP' WHERE company_no IS NULL`.
- After migration, all existing definitions SHALL have a valid company assignment.
- The default company "TWSBP" SHALL be active and selectable for new definitions.

#### Scenario: Migration creates default company

- WHEN the migration `[timestamp]-CreateCompaniesTable.ts` is executed
- THEN the system SHALL insert a company record with company_no='TWSBP' and is_active=1
- AND this company SHALL be available immediately for app definition creation

#### Scenario: Migration assigns existing definitions

- WHEN the migration `[timestamp]-AddCompanyNoToAppDefinition.ts` is executed
- THEN all existing app definitions with NULL company_no SHALL be updated to company_no='TWSBP'
- AND no definitions shall remain unassigned after migration
- AND the foreign key constraint shall be created successfully
