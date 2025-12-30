## ADDED Requirements

### Requirement: Document Stage Management

The system SHALL provide administrators with ability to create, update, delete, and manage document stages that are used to categorize documents into tabs.

#### Scenario: Admin creates new document stage

- **WHEN** an authenticated admin submits a new stage via POST `/document-stages`
- **AND** provides title (e.g., "第五階") and sort_order
- **THEN** system SHALL create a new stage record in `TC_APP_DOC_STAGES` table
- **AND** generate unique 20-character ID
- **AND** set created_at and updated_at timestamps to current UTC+8 time
- **AND** return created stage in response

#### Scenario: Admin updates document stage

- **WHEN** an authenticated admin updates a stage via PUT `/document-stages/:id`
- **AND** provides new title and/or sort_order
- **THEN** system SHALL update stage record with provided values
- **AND** update updated_at timestamp to current UTC+8 time
- **AND** return updated stage in response

#### Scenario: Admin deletes document stage

- **WHEN** an authenticated admin deletes a stage via DELETE `/document-stages/:id`
- **AND** no documents are assigned to the stage
- **THEN** system SHALL delete the stage record from `TC_APP_DOC_STAGES` table
- **AND** return 204 No Content status

#### Scenario: Prevent deletion of stage with assigned documents

- **WHEN** an authenticated admin attempts to delete a stage
- **AND** one or more documents are currently assigned to the stage
- **THEN** system SHALL reject the deletion request
- **AND** return 400 Bad Request status with error message indicating documents must be reassigned first
- **AND** stage MUST remain in the system

#### Scenario: List all document stages

- **WHEN** an authenticated admin or manager requests GET `/document-stages`
- **THEN** system SHALL return all stages ordered by sort_order ascending
- **AND** include stage id, title, and sort_order in response
- **AND** regular users cannot access this endpoint (403 Forbidden)

#### Scenario: Stage ordering affects tab display

- **WHEN** admin sets sort_order values for stages (e.g., 1, 2, 3, 4)
- **THEN** document tabs SHALL appear in frontend in the same order
- **AND** lower sort_order stages appear leftmost
- **AND** higher sort_order stages appear rightmost

### Requirement: Dynamic Document Tabs

The system SHALL render document listing tabs dynamically based on configured stages instead of hardcoded values, allowing administrators to customize tab names and quantity without code changes.

#### Scenario: Document tabs render from API data

- **WHEN** user opens document center page
- **THEN** system SHALL fetch all stages from `/document-stages` endpoint
- **AND** render a tab for each stage using stage title as tab label
- **AND** use stage id as tab value for filtering
- **AND** order tabs according to stage sort_order

#### Scenario: Default tab selection

- **WHEN** user opens document center page for the first time
- **THEN** system SHALL select first stage (lowest sort_order) as active tab
- **AND** display documents belonging to that stage
- **AND** remember user's last selected tab during session

#### Scenario: Empty stage shows no documents

- **WHEN** user selects a stage tab that has no assigned documents
- **THEN** system SHALL display empty state message in documents table
- **AND** show appropriate icon and text: "此階段沒有文檔"

#### Scenario: Stage management button visible to admins

- **WHEN** an authenticated admin views document center page
- **THEN** page header SHALL display "管理階段" (Manage Stages) button
- **AND** button navigates to `/document-stages` page
- **AND** regular users and managers MUST NOT see this button

### Requirement: Document Stage Assignment

The system SHALL require stage assignment when creating or editing documents, with default selection to the first stage.

#### Scenario: Document creation requires stage selection

- **WHEN** an admin or manager creates a new document
- **THEN** document creation form SHALL display a stage dropdown
- **AND** populate dropdown with all available stages ordered by sort_order
- **AND** make stage selection required (form validation)
- **AND** pre-select first stage (lowest sort_order) as default
- **AND** include selected stageId in document creation request

#### Scenario: Document edit allows stage change

- **WHEN** an admin or manager edits an existing document
- **THEN** document edit form SHALL display current stage in dropdown
- **AND** allow changing stage to any available stage
- **AND** include updated stageId in document update request
- **AND** document SHALL be reassigned to new stage in the database

#### Scenario: Stage dropdown shows correct titles

- **WHEN** user views document creation or edit form
- **AND** stages exist with titles: "第一階", "第二階", "第三階", "第四階"
- **THEN** stage dropdown SHALL display these exact titles
- **AND** dropdown options SHALL be sorted by sort_order (1, 2, 3, 4)

#### Scenario: Stage assigned in database

- **WHEN** a document is created or updated with a stageId
- **THEN** system SHALL set the document's stage_id column to the selected stage's id
- **AND** establish foreign key relationship to `TC_APP_DOC_STAGES` table
- **AND** persist the relationship for subsequent queries

## MODIFIED Requirements

### Requirement: Document Upload Workflow

The system SHALL allow users with admin or manager role to upload new documents and update existing ones using an Office file (Word/Excel) plus an optional PDF version, validating supported file types and size limits, and requiring stage assignment.

#### Scenario: Admin uploads new document with stage

- **WHEN** an admin opens document upload form
- **AND** selects a Word or Excel file and optionally a PDF file
- **AND** enters document kind, code, name, version
- **AND** selects a stage from dropdown
- **THEN** system SHALL upload files to configured storage
- **AND** create a new document record linked to both Office and PDF file references
- **AND** assign document to selected stage (stage_id)

#### Scenario: Manager updates document stage

- **WHEN** a manager updates an existing document
- **AND** changes the stage assignment
- **THEN** system SHALL update document record with new file references and version
- **AND** reassign document to new stage (update stage_id)
- **AND** set last modifier and modified date based on authenticated user and current time in UTC+8

### Requirement: Document Listing UI

The system SHALL provide a document listing page that shows available documents filtered by selected stage, with dynamic tabs and actions aligned with user permissions.

#### Scenario: Admin and manager document list with stage tabs

- **WHEN** an admin or manager opens document center page
- **THEN** UI SHALL display tabs for all configured stages (dynamic, not hardcoded)
- **AND** selected tab's documents SHALL appear in table with kind, code, name, version, and last updated information
- **AND** show actions to upload new documents, replace existing ones, and download Office/PDF files per role rules
- **AND** display "管理階段" button for stage management (admin only)

#### Scenario: Regular user document list with stage tabs

- **WHEN** a regular user opens document center page
- **THEN** UI SHALL display same dynamic tabs for all configured stages
- **AND** selected tab's documents SHALL appear in table in read-only mode
- **AND** only show a download action for PDF files, with no upload or Office download actions

#### Scenario: Document list filters by stage

- **WHEN** user selects a different stage tab
- **THEN** system SHALL filter document table to show only documents assigned to that stage
- **AND** search queries SHALL only search within the currently selected stage
- **AND** document count badge SHALL update to reflect filtered results

### Requirement: Document Listing Filters

The system SHALL support basic filtering and search on document listing so users can quickly find documents they need, with stage-based filtering and search within the selected stage.

#### Scenario: Search documents within selected stage

- **WHEN** a user enters text into search field on document list
- **AND** a stage tab is selected
- **THEN** system SHALL filter table to documents whose:
  - stage_id matches the selected stage tab
  - AND kind, code, or name contains search text (case-insensitive)
- **AND** clearing search filter SHALL restore full list for that stage

#### Scenario: Switching stage tabs resets search

- **WHEN** user has entered search text
- **AND** then switches to a different stage tab
- **THEN** system SHALL clear the search filter
- **AND** display all documents in the newly selected stage
- **AND** user can enter new search text to filter within that stage

#### Scenario: Document count badge shows filtered results

- **WHEN** search text is entered and documents are filtered
- **THEN** count badge SHALL show "X / Y" format where:
  - X = number of documents matching search in selected stage
  - Y = total number of documents in selected stage
