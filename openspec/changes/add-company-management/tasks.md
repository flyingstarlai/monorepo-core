## 1. Database Migrations (Backend)

- [x] 1.1 Create migration file `[timestamp]-CreateCompaniesTable.ts` to create TC_APP_COMPANY table
  - Create table with columns: company_no (PK), company_name, is_active, created_at, updated_at
  - Add indexes on is_active and created_at columns
  - Insert default company row: company_no='TWSBP', company_name='TWSBP', is_active=1

- [x] 1.2 Create migration file `[timestamp]-AddCompanyNoToAppDefinition.ts` to modify TC_APP_DEFINITION
  - Add company_no column (nullable) to TC_APP_DEFINITION
  - Update all existing definitions: `UPDATE TC_APP_DEFINITION SET company_no='TWSBP' WHERE company_no IS NULL`
  - Create foreign key constraint to TC_APP_COMPANY.company_no
  - Create index on company_no column

- [ ] 1.3 Run migrations and verify table structure and default data

## 2. Backend Entity Layer

- [x] 2.1 Create entity file `apps/api/src/app-builder/entities/company.entity.ts`
  - Define Company entity with all fields and proper decorators
  - Map to TC_APP_COMPANY table

- [x] 2.2 Update entity file `apps/api/src/app-builder/entities/app-definition.entity.ts`
  - Add companyNo column
  - Add @ManyToOne relationship to Company entity
  - Add company relation property

- [x] 2.3 Update exports in `apps/api/src/app-builder/entities/index.ts`
  - Export Company entity

## 3. Backend DTO Layer

- [x] 3.1 Create DTO file `apps/api/src/app-builder/dto/company.dto.ts`
  - CreateCompanyDto: companyNo, companyName, isActive
  - UpdateCompanyDto: companyName, isActive
  - CompanyDto: all fields with timestamps

- [x] 3.2 Update DTO file `apps/api/src/app-builder/dto/app-definition.dto.ts`
  - Add companyNo field to CreateDefinitionDto
  - Add companyNo field to UpdateDefinitionDto

## 4. Backend Service Layer

- [x] 4.1 Create service file `apps/api/src/app-builder/services/company.service.ts`
  - Implement findAll() to get all active companies
  - Implement findById(companyNo) to get single company
  - Implement create(dto) to create new company with validation
  - Implement update(companyNo, dto) to update company
  - Implement delete(companyNo) to delete company with cascade check
  - Add proper error handling and logging

- [x] 4.2 Update service file `apps/api/src/app-builder/services/app-definition.service.ts`
  - Modify findAll() to accept optional companyNo filter parameter
  - Add findByCompany(companyNo) method for company-specific definitions
  - Update create() to handle companyNo assignment
  - Update update() to handle companyNo updates
  - Ensure validation for existing companyNo

## 5. Backend Controller Layer

- [x] 5.1 Create controller file `apps/api/src/app-builder/controllers/company.controller.ts`
  - GET /app-builder/companies - list all companies
  - GET /app-builder/companies/:companyNo - get one company
  - POST /app-builder/companies - create company (admin/manager only)
  - PUT /app-builder/companies/:companyNo - update company (admin/manager only)
  - DELETE /app-builder/companies/:companyNo - delete company (admin/manager only)
  - PATCH /app-builder/companies/:companyNo/toggle-active - toggle status (admin/manager only)
  - Apply proper Swagger decorators and validation

- [x] 5.2 Update controller file `apps/api/src/app-builder/controllers/app-builder.controller.ts`
  - Add optional @Query('companyNo') parameter to getDefinitions() endpoint

## 6. Backend Module Configuration

- [x] 6.1 Update module file `apps/api/src/app-builder/app-builder.module.ts`
  - Add Company to TypeOrmModule.forFeature()
  - Add CompanyController to controllers array
  - Add CompanyService to providers array
  - Export CompanyService

## 7. Frontend Type Definitions

- [x] 7.1 Update types file `apps/web/src/lib/types.ts`
  - Add Company interface with all fields
  - Add companyNo field to MobileAppDefinition interface
  - Add CreateCompanyData, UpdateCompanyData types

## 8. Frontend API Service

- [x] 8.1 Update service file `apps/web/src/lib/app-builder.service.ts`
  - Add getCompanies() method
  - Modify getDefinitions() to accept optional companyNo filter parameter

## 9. Frontend React Query Hooks

- [x] 9.1 Update hooks file `apps/web/src/features/app-builder/hooks/use-app-builder.ts`
  - Implement useCompanies() hook
  - Implement useCompany(companyNo) hook
  - Implement useCreateCompany() mutation with cache invalidation
  - Implement useUpdateCompany(companyNo) mutation with cache invalidation
  - Implement useDeleteCompany() mutation with cache invalidation
  - Implement useToggleCompanyActive() mutation with cache invalidation
  - Modify useDefinitions() to accept optional companyNo filter

## 10. Company Management UI Components

- [x] 10.1 Create component file `apps/web/src/features/app-builder/components/company-table-columns.tsx`
  - Define table columns: Company No, Company Name, Status, Created At, Updated At, Actions
  - Add edit, delete, and toggle status actions

- [x] 10.2 Create component file `apps/web/src/features/app-builder/components/company-data-table.tsx`
  - Wrap TanStack Table with company columns
  - Add loading state, pagination support

- [x] 10.3 Create component file `apps/web/src/features/app-builder/components/company-form.tsx`
  - Create form for adding/editing companies
  - Include companyNo (disabled when editing), companyName, isActive fields
  - Add proper validation and error handling

- [x] 10.4 Create component file `apps/web/src/features/app-builder/components/company-table-actions.tsx`
  - Implement edit, delete, and toggle status handlers
  - Add confirmation dialogs for destructive actions

## 11. Company Management Page

- [x] 11.1 Create route file `apps/web/src/routes/_authenticated/app-builder.companies.tsx`
  - Implement full CRUD interface for companies
  - Add table view with all companies
  - Add Create/Edit dialogs
  - Add Delete confirmation
  - Add Toggle Active status functionality
  - Route: `/app-builder/companies`

## 12. Update App Builder Index Page

- [x] 12.1 Update page file `apps/web/src/features/app-builder/app-builder.page.tsx`
  - Add company filter dropdown (Combobox) next to search
  - Add "All Companies" option as default
  - Fetch companies via useCompanies() hook
  - Filter definitions by selected company
  - Update filteredDefinitions logic to include company filter

## 13. Update Definition Cards

- [x] 13.1 Update component file `apps/web/src/features/app-builder/components/definition-card.tsx`
  - Display company badge/icon if company is assigned
  - Show company name (e.g., "TWSBP") on card

## 14. Update Definition Create Form

- [x] 14.1 Update route file `apps/web/src/routes/_authenticated/app-builder.create.tsx`
  - Add company selection dropdown (Combobox)
  - Fetch companies via useCompanies() hook
  - Set default company to "TWSBP"
  - Make company field required

## 15. Update Definition Edit Form

- [ ] 15.1 Locate and update definition edit route/component
  - Add company selection dropdown similar to create form
  - Pre-populate with current companyNo
  - Allow company changes on edit

## 16. Navigation & Routing

- [x] 16.1 Add "Companies" link to app builder sidebar/navigation
  - Add appropriate icon (Building2 or similar)
  - Ensure proper role-based visibility (admin/manager only)

## 17. Testing & Validation

- [ ] 17.1 Test backend API endpoints
  - Verify company CRUD operations work correctly
  - Verify company filter on definitions works
  - Test foreign key constraints
  - Verify default company "TWSBP" exists

- [ ] 17.2 Test frontend UI
  - Test company management page CRUD operations
  - Test company filter on definitions
  - Test creating definition with company assignment
  - Test editing company on definitions
  - Verify company badge displays on cards

- [ ] 17.3 Migration validation
  - Confirm existing definitions assigned to "TWSBP"
  - Verify backward compatibility (NULL values handled)
  - Test rollback procedure

## 18. Documentation

- [ ] 18.1 Update any relevant documentation
  - Document new company entity structure
  - Update API documentation if needed
  - Add migration notes for future reference

- [ ] 18.2 Final checklist review
  - Confirm all tasks completed
  - Verify no TODO comments remain
  - Run lint and typecheck commands
  - Ensure all tests pass
