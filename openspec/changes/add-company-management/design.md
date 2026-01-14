## Context

The App Builder feature currently manages app definitions as a flat list without organizational grouping. Organizations need to manage apps belonging to different business entities (e.g., different clients, divisions, or projects) within the same system. Adding a company entity provides a logical grouping mechanism while maintaining backward compatibility with existing data.

## Goals / Non-Goals

### Goals

- Enable app definitions to be grouped by company for better organization
- Provide full CRUD UI for company management similar to existing departments
- Maintain backward compatibility with existing unassigned definitions
- Use default company "TWSBP" for existing data migration
- Follow existing architectural patterns (department implementation as reference)
- Implement flat company structure (no parent/child hierarchy)

### Non-Goals

- Hierarchical company organization (parent/child relationships)
- Company-based user assignment (companies are for app definitions only)
- Multi-tenant isolation (shared infrastructure, just logical grouping)
- Per-company settings or configurations (companies are just grouping tags)

## Decisions

### Database Schema

- **Decision**: Use `company_no` as primary key (naming consistent with `dept_no`)
- **Rationale**: Follows existing department pattern (`dept_no`) for consistency across the codebase
- **Alternatives considered**: Using `id` or `company_id` - rejected for consistency with existing patterns

### Relationship Design

- **Decision**: One-to-many relationship (Company 1 → N MobileAppDefinition)
- **Rationale**: Multiple apps can belong to one company; each app belongs to at most one company
- **Alternatives considered**: Many-to-many relationship - rejected due to complexity and unclear use case

### Company on App Definition

- **Decision**: `company_no` field is nullable on `TC_APP_DEFINITION`
- **Rationale**: Backward compatibility - existing definitions won't have company assigned initially, allows future flexibility
- **Alternatives considered**: Non-nullable field - rejected due to migration complexity and breaking changes

### Default Company Strategy

- **Decision**: Create default company "TWSBP" and assign all existing definitions to it
- **Rationale**: Immediate usability - existing definitions have a valid company, no manual cleanup needed
- **Alternatives considered**: Leave unassigned (NULL) - rejected (breaks filtering UX), Require manual assignment - rejected (too much manual work)

### Flat vs Hierarchical Companies

- **Decision**: Flat company structure (no parent/child relationships)
- **Rationale**: Simpler implementation, sufficient for current requirements (unlike departments which have hierarchy)
- **Alternatives considered**: Hierarchical structure - rejected (adds complexity without clear requirement)

### UI Pattern

- **Decision**: Follow department management UI pattern exactly
- **Rationale**: Consistency across the application, familiar UX for users
- **Alternatives considered**: Different UI pattern - rejected (inconsistent, more learning curve)

### Role-Based Access

- **Decision**: Company management restricted to admin and manager roles only
- **Rationale**: Follows existing department management pattern, prevents unauthorized organizational changes
- **Alternatives considered**: All authenticated users - rejected (security risk, inconsistent with existing features)

## Risks / Trade-offs

### Risks

- **Migration Risk**: Existing data migration to default company could fail if constraints violated
  - **Mitigation**: Test migration in staging, provide rollback procedure
- **Foreign Key Violation**: Deleting company with assigned app definitions could fail
  - **Mitigation**: Add cascade check in delete endpoint, return clear error message
- **NULL Company Values**: Queries might need to handle NULL company_no values
  - **Mitigation**: Ensure all service methods handle NULL gracefully, default company assignment in migration
- **UI Complexity**: Additional filter could clutter interface
  - **Mitigation**: Use collapsible or well-placed filter, default to "All Companies"

### Trade-offs

- **Flexibility vs Simplicity**: Flat structure is simpler but less flexible than hierarchical
  - **Accepted**: Current requirements don't need hierarchy
- **Backward Compatibility vs Clean Slate**: Nullable field maintains compatibility but introduces NULL handling complexity
  - **Accepted**: Better UX (no data loss) outweighs code complexity
- **Consistency vs DRY**: Following department pattern duplicates some code but provides consistency
  - **Accepted**: Consistency valuable for maintenance and onboarding

## Migration Plan

### Forward Migration

1. Create `TC_APP_COMPANY` table with indexes
2. Insert default company row: `company_no='TWSBP', company_name='TWSBP', is_active=1`
3. Add `company_no` column to `TC_APP_DEFINITION` (NULL default)
4. Update existing definitions: `UPDATE TC_APP_DEFINITION SET company_no='TWSBP' WHERE company_no IS NULL`
5. Create foreign key constraint: `FK_APP_DEFINITION_COMPANY` referencing `TC_APP_COMPANY.company_no`
6. Create index on `company_no` column

### Rollback Procedure

1. Drop foreign key constraint
2. Drop `company_no` column from `TC_APP_DEFINITION`
3. Drop `TC_APP_COMPANY` table
4. Revert entity/service/controller code

### Data Validation

- Verify all definitions have company assigned after migration
- Confirm default company "TWSBP" exists
- Test foreign key constraint with valid and invalid company_no values
- Verify index creation improves query performance

## Open Questions

- Should companies have additional metadata (logo, contact email, description)?
  - **Decision**: Start minimal, extend in future if needed
- Should companies be tied to departments?
  - **Decision**: No, companies are for app organization only, departments are for users
- Should company be required on app definition creation?
  - **Decision**: Yes, default to "TWSBP" to ensure all definitions have company
