## 1. Database Migration

### 1.1 Create Document Stages Table

- [ ] 1.1.1 Create migration file for `TC_APP_DOC_STAGES` table
- [ ] 1.1.2 Add columns: `id` (nvarchar(20), primary), `title` (nvarchar(100)), `sort_order` (int), `created_at` (datetime2), `updated_at` (datetime2)
- [ ] 1.1.3 Create index on `sort_order` for efficient ordering
- [ ] 1.1.4 Create seed data for 4 initial stages: 第一階, 第二階, 第三階, 第四階 (sort_order 1-4)

### 1.2 Update Documents Table

- [ ] 1.2.1 Add `stage_id` column to `TC_APP_DOCS` table (nvarchar(20), nullable)
- [ ] 1.2.2 Create foreign key constraint: `TC_APP_DOCS.stage_id` → `TC_APP_DOC_STAGES.id`
- [ ] 1.2.3 Create index on `stage_id` for efficient filtering
- [ ] 1.2.4 Migrate existing documents: Update all documents to have `stage_id` set to first stage's id

## 2. Backend API - Document Stages

### 2.1 Create Document Stage Entity and DTOs

- [ ] 2.1.1 Create `DocumentStage` entity in `apps/api/src/documents/entities/document-stage.entity.ts`
- [ ] 2.1.2 Create `CreateDocumentStageDto` with fields: title (string), sortOrder (number)
- [ ] 2.1.3 Create `UpdateDocumentStageDto` with fields: title (string), sortOrder (number)
- [ ] 2.1.4 Create `DocumentStageResponseDto` with fields: id, title, sortOrder
- [ ] 2.1.5 Register `DocumentStage` entity in `documents.module.ts`

### 2.2 Create Document Stage Service

- [ ] 2.2.1 Create `DocumentStageService` in `apps/api/src/documents/document-stage.service.ts`
- [ ] 2.2.2 Implement `findAll()` method - returns all stages ordered by `sort_order`
- [ ] 2.2.3 Implement `create(dto: CreateDocumentStageDto)` method - creates new stage
- [ ] 2.2.4 Implement `update(id: string, dto: UpdateDocumentStageDto)` method - updates stage
- [ ] 2.2.5 Implement `remove(id: string)` method - deletes stage with validation
- [ ] 2.2.6 Add validation in `remove()` to prevent deletion if stage has assigned documents
- [ ] 2.2.7 Implement `countDocuments(id: string)` method - counts documents in stage

### 2.3 Create Document Stage Controller

- [ ] 2.3.1 Create `DocumentStageController` in `apps/api/src/documents/document-stage.controller.ts`
- [ ] 2.3.2 Add `GET /document-stages` endpoint - returns all stages (admin/manager)
- [ ] 2.3.3 Add `POST /document-stages` endpoint - creates stage (admin only)
- [ ] 2.3.4 Add `PUT /document-stages/:id` endpoint - updates stage (admin only)
- [ ] 2.3.5 Add `DELETE /document-stages/:id` endpoint - deletes stage (admin only)
- [ ] 2.3.6 Add proper Swagger documentation for all endpoints
- [ ] 2.3.7 Add error handling for document count validation on delete

## 3. Backend API - Update Documents Module

### 3.1 Update Documents Entity

- [ ] 3.1.1 Add `stageId` column to `DocumentsEntity`
- [ ] 3.1.2 Add `stage` relationship to `DocumentStage` entity

### 3.2 Update Documents DTOs

- [ ] 3.2.1 Add `stageId` field to `CreateDocumentDto`
- [ ] 3.2.2 Add `stageId` field to `UpdateDocumentDto`
- [ ] 3.2.3 Add `stage` field (DocumentStageResponseDto) to `DocumentResponseDto`

### 3.3 Update Documents Service

- [ ] 3.3.1 Update `findAll()` to accept optional `stageId` filter parameter
- [ ] 3.3.2 Update `findAll()` query to filter by `stageId` if provided
- [ ] 3.3.3 Update `create()` to set `stageId` from DTO
- [ ] 3.3.4 Update `update()` to update `stageId` from DTO if provided
- [ ] 3.3.5 Update responses to include stage information

### 3.4 Update Documents Controller

- [ ] 3.4.1 Update `GET /documents` endpoint to accept optional `stageId` query parameter
- [ ] 3.4.2 Pass `stageId` to `findAll()` service method
- [ ] 3.4.3 Update Swagger documentation

## 4. Frontend - Document Stages Management

### 4.1 Create Document Stages Types

- [ ] 4.1.1 Create `DocumentStage` interface in `apps/web/src/features/documents/types/documents.types.ts`
- [ ] 4.1.2 Create `CreateDocumentStage` interface
- [ ] 4.1.3 Create `UpdateDocumentStage` interface

### 4.2 Create Document Stages Hook

- [ ] 4.2.1 Create `useDocumentStages()` hook in `apps/web/src/features/documents/hooks/use-document-stages.ts`
- [ ] 4.2.2 Add query for fetching all stages (ordered by sort_order)
- [ ] 4.2.3 Add mutation for creating stage (admin only)
- [ ] 4.2.4 Add mutation for updating stage (admin only)
- [ ] 4.2.5 Add mutation for deleting stage (admin only)
- [ ] 4.2.6 Add `invalidateQueries` on mutations

### 4.3 Create Document Stages Page

- [ ] 4.3.1 Create route: `/document-stages` in `apps/web/src/routes/_authenticated/document-stages.index.tsx`
- [ ] 4.3.2 Create `DocumentStagesPage` component in `apps/web/src/features/documents/pages/document-stages.page.tsx`
- [ ] 4.3.3 Add table listing all stages with columns: 排序, 標題, 文檔數量, 操作
- [ ] 4.3.4 Add "新增階段" (Add Stage) button for admins
- [ ] 4.3.5 Add edit button for each stage (opens modal)
- [ ] 4.3.6 Add delete button for each stage (with confirmation)
- [ ] 4.3.7 Disable delete button if stage has assigned documents
- [ ] 4.3.8 Implement add/edit modal with form fields: 標題 (title), 排序 (sort_order)
- [ ] 4.3.9 Implement delete confirmation dialog
- [ ] 4.3.10 Show error toast if trying to delete stage with documents
- [ ] 4.3.11 Add "管理階段" (Manage Stages) button in documents page header (admin only)

### 4.4 Update Documents Page

- [ ] 4.4.1 Import `useDocumentStages` hook in `documents.page.tsx`
- [ ] 4.4.2 Fetch stages on component mount
- [ ] 4.4.3 Replace hardcoded TabsList with dynamic tabs from API
- [ ] 4.4.4 Set default tab value to first stage id or first tab
- [ ] 4.4.5 Update `filteredDocuments` logic to filter by selected stage
- [ ] 4.4.6 Remove hardcoded tab values (first, second, third, fourth)
- [ ] 4.4.7 Keep all 4 tab contents but render them conditionally or unify into single table
- [ ] 4.4.8 Update search to apply within selected stage only

## 5. Frontend - Document Forms

### 5.1 Update Document Create Page

- [ ] 5.1.1 Add stage dropdown field in document create form
- [ ] 5.1.2 Fetch stages using `useDocumentStages` hook
- [ ] 5.1.3 Render stage options in dropdown (sorted by sort_order)
- [ ] 5.1.4 Make stage selection required
- [ ] 5.1.5 Default to first stage if no selection
- [ ] 5.1.6 Include `stageId` in form submission data

### 5.2 Update Document Edit Page

- [ ] 5.2.1 Add stage dropdown field in document edit form
- [ ] 5.2.2 Pre-select current document's stage
- [ ] 5.2.3 Allow changing document stage
- [ ] 5.2.4 Include `stageId` in form submission data

## 6. Navigation and Routing

### 6.1 Add Navigation Links

- [ ] 6.1.1 Add "管理階段" link to AppSidebar (admin only)
- [ ] 6.1.2 Ensure proper role check before showing link

## 7. Testing & Validation

### 7.1 Backend Testing

- [ ] 7.1.1 Write unit tests for `DocumentStageService.findAll()`
- [ ] 7.1.2 Write unit tests for `DocumentStageService.create()`
- [ ] 7.1.3 Write unit tests for `DocumentStageService.update()`
- [ ] 7.1.4 Write unit tests for `DocumentStageService.remove()` with validation
- [ ] 7.1.5 Write unit tests for `DocumentStageService.countDocuments()`
- [ ] 7.1.6 Write e2e tests for document stage CRUD endpoints
- [ ] 7.1.7 Test document-stage deletion prevention when documents exist
- [ ] 7.1.8 Test migration assigns existing documents to first stage

### 7.2 Frontend Testing

- [ ] 7.2.1 Test dynamic tabs render correctly from API
- [ ] 7.2.2 Test document filtering by selected stage
- [ ] 7.2.3 Test stage management page - create, edit, delete stages
- [ ] 7.2.4 Test stage deletion prevention when documents assigned
- [ ] 7.2.5 Test document creation with stage dropdown
- [ ] 7.2.6 Test document edit with stage dropdown
- [ ] 7.2.7 Test stage ordering (sort_order) is respected in UI

### 7.3 Integration Testing

- [ ] 7.3.1 Test full flow: Create stage → Create document in stage → View in tab → Edit stage → Update document stage → Delete stage
- [ ] 7.3.2 Test search within stage filters documents correctly
- [ ] 7.3.3 Test role-based access (admin can manage stages, others cannot)
- [ ] 7.3.4 Test migration script on database with existing documents

## 8. Documentation & Deployment

### 8.1 Documentation

- [ ] 8.1.1 Update API documentation with document stage endpoints
- [ ] 8.1.2 Document migration process for existing documents
- [ ] 8.1.3 Document stage deletion behavior
- [ ] 8.1.4 Add screenshots and usage examples to README

### 8.2 Deployment

- [ ] 8.2.1 Run database migration in development environment
- [ ] 8.2.2 Verify seed data creates initial 4 stages
- [ ] 8.2.3 Test migration assigns existing documents correctly
- [ ] 8.2.4 Verify frontend dynamic tabs work in production
- [ ] 8.2.5 Monitor for any issues with stage-based filtering
