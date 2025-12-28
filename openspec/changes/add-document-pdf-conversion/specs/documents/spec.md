## ADDED Requirements

### Requirement: PDF Conversion from Office Documents

The system SHALL provide on-demand PDF conversion of Office documents using OnlyOffice Document Server's Conversion API, with real-time progress feedback and automatic download upon completion.

#### Scenario: User initiates PDF conversion

- **WHEN** an authenticated user with appropriate document access clicks "Download PDF" button on office page
- **AND** document has an Office file (`officeFilePath` exists)
- **THEN** system SHALL initiate OnlyOffice async conversion via `POST /documents/:id/convert-pdf`
- **AND** system SHALL return a unique `jobId` for tracking conversion status
- **AND** system SHALL immediately start polling conversion status

#### Scenario: System converts document asynchronously

- **WHEN** backend receives conversion request for a valid document
- **AND** OnlyOffice Document Server is available
- **THEN** system SHALL build OnlyOffice Conversion API request with `async: true`
- **AND** request SHALL include document URL, file type, output type (PDF), and unique key
- **AND** request SHALL be signed with JWT using `ONLYOFFICE_JWT_SECRET`
- **AND** system SHALL POST request to `${ONLYOFFICE_DOCUMENT_SERVER_URL}/converter`
- **AND** system SHALL return `jobId` immediately without waiting for conversion

#### Scenario: User polls conversion status

- **WHEN** frontend polls `GET /documents/:id/convert-status/:jobId`
- **AND** job exists and conversion is in progress
- **THEN** system SHALL return current status: `pending`, `processing`, `completed`, or `failed`
- **AND** if status is `pending` or `processing`, frontend SHALL continue polling every 2 seconds
- **AND** if status is `completed`, frontend SHALL stop polling and trigger PDF download
- **AND** if status is `failed`, frontend SHALL show error message and stop polling

#### Scenario: Conversion completes successfully

- **WHEN** OnlyOffice completes PDF conversion successfully
- **THEN** system SHALL download converted PDF from OnlyOffice's file URL
- **AND** system SHALL save PDF to filesystem at `{UPLOAD_DEST_DIR}/{kind}/{id}/pdf/{id}.pdf`
- **AND** system SHALL update conversion job status to `completed` with PDF file path
- **AND** system SHALL NOT update `pdfFilePath` column in database
- **AND** system SHALL update document `modifiedBy` and `modifiedAtUser` fields

#### Scenario: User downloads converted PDF

- **WHEN** conversion status is `completed` and user clicks download or auto-download triggers
- **THEN** system SHALL stream PDF file from filesystem via `GET /documents/:id/download-pdf`
- **AND** response SHALL have headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="{documentNumber}.pdf"`
  - `Cache-Control: no-cache`
- **AND** system SHALL record download activity (update `downloadedBy` and `downloadedAtUser`)

#### Scenario: Conversion fails

- **WHEN** OnlyOffice Conversion API returns error or timeout occurs
- **THEN** system SHALL update conversion job status to `failed`
- **AND** job SHALL include error message describing failure reason
- **AND** frontend SHALL display user-friendly error message in Traditional Chinese
- **AND** user SHALL be able to retry conversion by clicking download button again

#### Scenario: Document access control for conversion

- **WHEN** user without sufficient document access requests PDF conversion
- **THEN** system SHALL reject request with 403 Forbidden status
- **AND** system SHALL NOT initiate conversion or return jobId

#### Scenario: Concurrent conversion requests for same document

- **WHEN** multiple users request conversion of the same document simultaneously
- **THEN** system SHALL check for existing conversion job within 1 hour
- **AND** if recent job exists, system SHALL return existing `jobId` instead of starting new conversion
- **AND** if no recent job, system SHALL create new job with unique timestamp
- **AND** each job SHALL have unique `jobId`: `${documentId}_${timestamp}`

#### Scenario: Server restart during conversion

- **WHEN** server restarts while conversion is in progress
- **THEN** in-memory job tracking SHALL be lost (no persistent storage)
- **AND** user SHALL need to re-initiate conversion by clicking download button again
- **AND** system SHALL start new conversion job when requested

### Requirement: Office File Download in Viewer Page

The system SHALL provide Office file download functionality within the OnlyOffice viewer page, consolidating document operations in a single location.

#### Scenario: User downloads Office file from viewer page

- **WHEN** authenticated user clicks "Download Office" button on `/documents/:id/office` page
- **AND** user has permission to download Office files (admin or manager role)
- **THEN** system SHALL download Office file via existing `GET /documents/:id/download?type=office` endpoint
- **AND** filename SHALL be `{documentNumber}.{extension}` based on file type
- **AND** button SHALL show loading state during download
- **AND** system SHALL display success toast: "Office 文檔下載成功"

#### Scenario: Regular user cannot download Office file from viewer

- **WHEN** authenticated user with role `user` attempts to download Office file
- **THEN** "Download Office" button SHALL be disabled or hidden
- **AND** user SHALL still see "Download PDF" button (after conversion)

#### Scenario: Document list page no longer has Office download button

- **WHEN** user views documents list page
- **THEN** system SHALL NOT display "Download Office" button in operations column
- **AND** system SHALL continue to display "開啟文檔/在線查看" button to navigate to office page
- **AND** system SHALL continue to display "下載 PDF" button for manually uploaded PDFs (if `pdfFilePath` exists)

#### Scenario: Download button shows correct file type label

- **WHEN** user views Office file in viewer page
- **AND** file is a Word document (.docx)
- **THEN** "Download Office" button SHALL display "下載 Word" (Download Word)
- **AND** if file is Excel (.xlsx), button SHALL display "下載 Excel"
- **AND** if file is other Office type, button SHALL display "下載 Office"

### Requirement: Conversion Progress Feedback

The system SHALL provide real-time feedback to users during PDF conversion process, including loading states and status updates.

#### Scenario: Conversion button shows loading state

- **WHEN** user clicks "Download PDF" and conversion is initiated
- **THEN** button SHALL display loading spinner or animated icon
- **AND** button text SHALL change to "轉換中..." (Converting...)
- **AND** button SHALL be disabled to prevent multiple simultaneous requests

#### Scenario: Completion triggers auto-download

- **WHEN** conversion status changes from `processing` to `completed`
- **AND** user initiated conversion (has active jobId)
- **THEN** frontend SHALL automatically trigger PDF download
- **AND** button SHALL revert to "下載 PDF" (Download PDF) state
- **AND** system SHALL display success toast: "PDF 下載成功"

#### Scenario: Timeout after long-running conversion

- **WHEN** conversion exceeds 5 minutes timeout
- **THEN** frontend SHALL stop polling after 150 attempts (2s interval × 150 = 5 min)
- **AND** system SHALL display error toast: "轉換超時，請稍後再試" (Conversion timeout, please try again later)
- **AND** user SHALL be able to retry by clicking download button again
