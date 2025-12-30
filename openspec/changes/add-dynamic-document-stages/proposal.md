## Why

The current document listing page has 4 hardcoded tabs (第一階, 第二階, 第三階, 第四階) that cannot be customized by administrators. This creates inflexibility as:

1. Tab names and count are hardcoded, requiring code changes to modify
2. Documents cannot be properly categorized or filtered by stage
3. New stages cannot be added without deployment
4. Existing stages cannot be renamed or removed

Adding a dynamic document stages system will allow admins to:

- Create, rename, and delete document stages as needed
- Assign documents to appropriate stages
- Customize tab ordering and names without code changes
- Reorganize documents as business needs evolve

## What Changes

- Create new `TC_APP_DOC_STAGES` table for managing document stages
- Add `stage_id` foreign key column to `TC_APP_DOCS` table
- Create backend CRUD endpoints for document stages (`/document-stages`)
- Add admin-only stage management page in frontend (`/document-stages`)
- Update documents page to use dynamic tabs from API
- Update document create/edit forms to include stage dropdown
- Migrate existing documents to be assigned to first stage
- Prevent stage deletion until all documents are reassigned

**BREAKING**: Existing tab filter logic will be replaced with stage-based filtering

## Impact

- Affected specs: documents (adds stage management and dynamic tabs)
- Affected code:
  - `apps/api/src/documents/*` - adds DocumentStage entity, service, controller
  - `apps/web/src/features/documents/*` - adds stage management UI and dynamic tabs
  - Database: New table `TC_APP_DOC_STAGES`, column `stage_id` in `TC_APP_DOCS`
- Migration required: Existing documents will be assigned to the first created stage
- UI change: Tabbed interface becomes dynamic with admin-managed stages
