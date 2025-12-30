## 1. Database Migration

### 1.1 Create Document Stages Table

- [x] 1.1.1 Create migration file for `TC_APP_DOC_STAGES` table
- [x] 1.1.2 Add columns: `id` (nvarchar(20), primary), `title` (nvarchar(100)), `sort_order` (int), `created_at` (datetime2), `updated_at` (datetime2)
- [x] 1.1.3 Create index on `sort_order` for efficient ordering
- [x] 1.1.4 Create seed data for 4 initial stages: 第一階, 第二階, 第三階, 第四階 (sort_order 1-4)

### 1.2 Update Documents Table

- [x] 1.2.1 Add `stage_id` column to `TC_APP_DOCS` table (nvarchar(20), nullable)
- [x] 1.2.2 Create foreign key constraint: `TC_APP_DOCS.stage_id` → `TC_APP_DOC_STAGES.id`
- [x] 1.2.3 Create index on `stage_id` for efficient filtering
- [x] 1.2.4 Migrate existing documents: Update all documents to have `stage_id` set to first stage's id

## 2. Backend API - Document Stages

### 2.1 Create Document Stage Entity and DTOs

- [x] 2.1.1 Create `DocumentStage` entity in `apps/api/src/documents/entities/document-stage.entity.ts`
- [x] 2.1.2 Create `CreateDocumentStageDto` with fields: title (string), sortOrder (number)
- [x] 2.1.3 Create `UpdateDocumentStageDto` with fields: title (string), sortOrder (number)
- [x] 2.1.4 Create `DocumentStageResponseDto` with fields: id, title, sortOrder
- [x] 2.1.5 Register `DocumentStage` entity in `documents.module.ts`

### 2.2 Create Document Stage Service

- [x] 2.2.1 Create `DocumentStageService` in `apps/api/src/documents/document-stage.service.ts`
- [x] 2.2.2 Implement `findAll()` method - returns all stages ordered by `sort_order`
- [x] 2.2.3 Implement `create(dto: CreateDocumentStageDto)` method - creates new stage
- [x] 2.2.4 Implement `update(id: string, dto: UpdateDocumentStageDto)` method - updates stage
- [x] 2.2.5 Implement `remove(id: string)` method - deletes stage with validation
- [x] 2.2.6 Add validation in `remove()` to prevent deletion if stage has assigned documents
- [x] 2.2.7 Implement `countDocuments(id: string)` method - counts documents in stage

### 2.3 Create Document Stage Controller

- [x] 2.3.1 Create `DocumentStageController` in `apps/api/src/documents/document-stage.controller.ts`
- [x] 2.3.2 Add `GET /document-stages` endpoint - returns all stages (admin/manager)
- [x] 2.3.3 Add `POST /document-stages` endpoint - creates stage (admin only)
- [x] 2.3.4 Add `PUT /document-stages/:id` endpoint - updates stage (admin only)
- [x] 2.3.5 Add `DELETE /document-stages/:id` endpoint - deletes stage (admin only)
- [x] 2.3.6 Add proper Swagger documentation for all endpoints
- [x] 2.3.7 Add error handling for document count validation on delete

## 3. Backend API - Update Documents Module

### 3.1 Update Documents Entity

- [x] 3.1.1 Add `stageId` column to `DocumentsEntity`
- [x] 3.1.2 Add `stage` relationship to `DocumentStage` entity

### 3.2 Update Documents DTOs

- [x] 3.2.1 Add `stageId` field to `CreateDocumentDto`
- [x] 3.2.2 Add `stageId` field to `UpdateDocumentDto`
- [x] 3.2.3 Add `stage` field (DocumentStageResponseDto) to `DocumentResponseDto`

### 3.3 Update Documents Service

- [x] 3.3.1 Update `findAll()` to accept optional `stageId` filter parameter
- [x] 3.3.2 Update `findAll()` query to filter by `stageId` if provided
- [x] 3.3.3 Update `create()` to set `stageId` from DTO
- [x] 3.3.4 Update `update()` to update `stageId` from DTO if provided
- [x] 3.3.5 Update responses to include stage information

### 3.4 Update Documents Controller

- [x] 3.4.1 Update `GET /documents` endpoint to accept optional `stageId` query parameter
- [x] 3.4.2 Pass `stageId` to `findAll()` service method
- [x] 3.4.3 Update Swagger documentation

## 4. Frontend - Document Stages Management

### 4.1 Create Document Stages Types

- [x] 4.1.1 Create `DocumentStage` interface in `apps/web/src/features/documents/types/documents.types.ts`
- [x] 4.1.2 Create `CreateDocumentStage` interface
- [x] 4.1.3 Create `UpdateDocumentStage` interface

### 4.2 Create Document Stages Hook

- [x] 4.2.1 Create `useDocumentStages()` hook in `apps/web/src/features/documents/hooks/use-document-stages.ts`
- [x] 4.2.2 Add query for fetching all stages (ordered by sort_order)
- [x] 4.2.3 Add mutation for creating stage (admin only)
- [x] 4.2.4 Add mutation for updating stage (admin only)
- [x] 4.2.5 Add mutation for deleting stage (admin only)
- [x] 4.2.6 Add `invalidateQueries` on mutations

### 4.3 Create Document Stages Page

- [x] 4.3.1 Create route: `/document-stages` in `apps/web/src/routes/_authenticated/document-stages.index.tsx`
- [x] 4.3.2 Create `DocumentStagesPage` component in `apps/web/src/features/documents/pages/document-stages.page.tsx`
- [x] 4.3.3 Add table listing all stages with columns: 排序, 標題, 文檔數量, 操作
- [x] 4.3.4 Add "新增階段" (Add Stage) button for admins
- [x] 4.3.5 Add edit button for each stage (opens modal)
- [x] 4.3.6 Add delete button for each stage (with confirmation)
- [x] 4.3.7 Disable delete button if stage has assigned documents
- [x] 4.3.8 Implement add/edit modal with form fields: 標題 (title), 排序 (sort_order)
- [x] 4.3.9 Implement delete confirmation dialog
- [x] 4.3.10 Show error toast if trying to delete stage with documents
- [x] 4.3.11 Add "管理階段" (Manage Stages) button in documents page header (admin only)

### 4.4 Update Documents Page

- [x] 4.4.1 Import `useDocumentStages` hook in `documents.page.tsx`
- [x] 4.4.2 Fetch stages on component mount
- [x] 4.4.3 Replace hardcoded TabsList with dynamic tabs from API
- [x] 4.4.4 Set default tab value to first stage id or first tab
- [x] 4.4.5 Update `filteredDocuments` logic to filter by selected stage
- [x] 4.4.6 Remove hardcoded tab values (first, second, third, fourth)
- [x] 4.4.7 Keep all 4 tab contents but render them conditionally or unify into single table
- [x] 4.4.8 Update search to apply within selected stage only

## 5. Frontend - Document Forms

### 5.1 Update Document Create Page

- [x] 5.1.1 Add stage dropdown field in document create form
- [x] 5.1.2 Fetch stages using `useDocumentStages` hook
- [x] 5.1.3 Render stage options in dropdown (sorted by sort_order)
- [x] 5.1.4 Make stage selection required
- [x] 5.1.5 Default to first stage if no selection
- [x] 5.1.6 Include `stageId` in form submission data

### 5.2 Update Document Edit Page

- [x] 5.2.1 Add stage dropdown field in document edit form
- [x] 5.2.2 Pre-select current document's stage
- [x] 5.2.3 Allow changing document stage
- [x] 5.2.4 Include `stageId` in form submission data
