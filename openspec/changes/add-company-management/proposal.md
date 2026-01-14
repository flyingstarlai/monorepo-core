## Why

App definitions currently exist as a flat list without organizational grouping. To better manage multiple projects or clients using the App Builder, we need to group app definitions by company. This allows organizations to separate and manage apps belonging to different business entities (e.g., different clients or divisions) within the same system.

## What Changes

- Add a new `TC_APP_COMPANY` table to store company information with a flat structure (no hierarchy)
- Create one-to-many relationship between `Company` and `MobileAppDefinition` entities
- Add `company_no` foreign key column to `TC_APP_DEFINITION` table
- Seed default company "TWSBP" and assign all existing app definitions to it
- Create full CRUD API for company management (`/app-builder/companies`)
- Add company filtering to app definitions endpoint
- Create company management UI at `/app-builder/companies` with full CRUD operations
- Update app builder UI to display company filter and company assignment
- Update definition forms to include company selection dropdown

## Impact

- Affected specs: app-builder (new capability spec)
- Affected code: Backend API (NestJS) - new module; Web UI - new pages and components
- External services: SQL Server (new TC_APP_COMPANY table, modify TC_APP_DEFINITION)
- Migration: Default company "TWSBP" will be created and assigned to all existing definitions

## Decisions

- Company relationship is flat (no parent/child hierarchy like departments)
- Company field is optional on app definition for backward compatibility
- Existing definitions will be assigned to default company "TWSBP" via migration
- Company management follows same pattern as departments CRUD UI
- Company filter on definitions uses dropdown selector (similar to build filters)
