## ADDED Requirements

### Requirement: Document Metadata and Storage

The system SHALL persist each managed document in a document-control table logically equivalent to `IDOCCTRL` with fields for document kind, code, name, current version, Office file reference (Word/Excel), PDF file reference, creator and created date, last modifier and modified date, and last downloader and download date.

#### Scenario: Store new document metadata

- **WHEN** an admin or manager successfully uploads a new document record
- **THEN** the system SHALL create a row in the document-control table with the provided kind, code, name, version, and file references
- **AND** set creator and created date based on the authenticated user and current time in UTC+8

### Requirement: Document Upload Workflow

The system SHALL allow users with admin or manager role to upload new documents and update existing ones using an Office file (Word/Excel) plus an optional PDF version, validating supported file types and size limits.

#### Scenario: Admin uploads new document with Office and PDF files

- **WHEN** an admin opens the document upload form and selects a Word or Excel file and a PDF file for the same document
- **AND** enters document kind, code, name, and version
- **THEN** the system SHALL upload the files to the configured storage
- **AND** create a new document record linked to both Office and PDF file references

#### Scenario: Manager updates existing document

- **WHEN** a manager uploads a new version of an existing document
- **THEN** the system SHALL update the document record with the new file references and version
- **AND** set last modifier and modified date based on the authenticated user and current time in UTC+8

### Requirement: Role-Based Document Access and Feature Flag

The system SHALL enforce document upload and download rules based on user role and the `FEATURE_DOC_UPLOAD` flag.

#### Scenario: Admin or manager can upload documents

- **WHEN** an authenticated user with admin or manager role accesses the document upload API or UI
- **THEN** the system SHALL allow the upload operation
- **AND** reject upload attempts from regular users with an appropriate authorization error.

#### Scenario: Manager can download Office and PDF files

- **WHEN** a manager views the document list
- **THEN** the UI SHALL show download actions for both Office and PDF files
- **AND** the API SHALL allow the manager to download either file type.

#### Scenario: Regular user can only download PDF

- **WHEN** a regular user views the document list
- **THEN** the UI SHALL only show a download action for the PDF version
- **AND** attempts to access Word or Excel downloads SHALL be rejected by the API with an authorization error.

#### Scenario: Feature flag disables document center

- **WHEN** `FEATURE_DOC_UPLOAD` is not set to `true`
- **THEN** the API SHALL not register document upload/download routes
- **AND** the Web UI SHALL hide document navigation and upload controls
- **AND** any direct calls to document APIs SHALL return a not-found or equivalent response.

### Requirement: Download Tracking and Audit

The system SHALL track who last downloaded each document and when, updating the document-control table accordingly.

#### Scenario: Record last downloader and download time

- **WHEN** any authenticated user downloads a document (Office or PDF)
- **THEN** the system SHALL update the last downloader and last download date fields for that document based on the user and current time in UTC+8
- **AND** persist these values so they are visible in subsequent queries.

### Requirement: Document Listing UI

The system SHALL provide a document listing page that shows available documents and aligns actions with user permissions.

#### Scenario: Admin and manager document list

- **WHEN** an admin or manager opens the document center page
- **THEN** the UI SHALL display a table of documents with kind, code, name, version, and last updated information
- **AND** show actions to upload new documents, replace existing ones, and download Office/PDF files per role rules.

#### Scenario: Regular user document list

- **WHEN** a regular user opens the document center page
- **THEN** the UI SHALL display the same document table in read-only mode
- **AND** only show a download action for PDF files, with no upload or Office download actions.

### Requirement: Documents Navigation in App Sidebar

The system SHALL expose the Document Center via a dedicated "Documents" navigation item in the authenticated AppSidebar, respecting role permissions and the `FEATURE_DOC_UPLOAD` flag.

#### Scenario: Documents menu visible when feature enabled

- **WHEN** `FEATURE_DOC_UPLOAD` is set to `true`
- **AND** an authenticated user (admin, manager, or regular user) views the AppSidebar
- **THEN** the sidebar SHALL display a "Documents" menu item that navigates to the document center page.

#### Scenario: Documents menu hidden when feature disabled

- **WHEN** `FEATURE_DOC_UPLOAD` is not set to `true`
- **THEN** the AppSidebar SHALL NOT show the "Documents" menu item
- **AND** users SHALL NOT be able to reach the document center page via sidebar navigation.

#### Scenario: Upload actions only for admin and manager

- **WHEN** an admin or manager navigates to the document center via the AppSidebar
- **THEN** the page SHALL show controls to upload or replace documents
- **AND** when a regular user navigates via the same "Documents" menu, the page SHALL NOT show any upload or replace controls.

### Requirement: Document Listing Filters

The system SHALL support basic filtering and search on the document listing so users can quickly find the document they need.

#### Scenario: Filter documents by kind

- **WHEN** a user selects one or more document kinds (e.g., procedure, form, policy) as a filter
- **THEN** the document list SHALL only show documents whose kind matches the selected filters
- **AND** clearing the filter SHALL restore the full list.

#### Scenario: Search by document code or name

- **WHEN** a user enters text into the search field on the document list
- **THEN** the system SHALL filter the table to documents whose code or name contains the search text (case-insensitive)
- **AND** the search SHALL work consistently for admin, manager, and regular users.

### Requirement: Supported File Types and Size Limits

The system SHALL only accept supported Office document types (Word, Excel) and PDF, and SHALL enforce a configurable maximum file size for uploads.

#### Scenario: Reject unsupported file type

- **WHEN** a user attempts to upload a file that is not Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`), or PDF (`.pdf`)
- **THEN** the system SHALL reject the upload
- **AND** display a clear validation error indicating the supported file types.

#### Scenario: Reject oversized file

- **WHEN** a user attempts to upload a file larger than the configured maximum size for document uploads
- **THEN** the system SHALL reject the upload
- **AND** display a clear validation error indicating that the file is too large and what the current size limit is.
