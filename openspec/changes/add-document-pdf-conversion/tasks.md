## 1. Backend Implementation

### 1.1 Documents Service - Conversion Job Tracking

- [x] Add `ConversionJob` interface with fields: documentId, status, pdfUrl, error, createdAt
- [x] Add in-memory `conversionJobs` Map storage to DocumentsService
- [x] Implement `initiatePdfConversion(documentId: string, user: User): Promise<string>` method
  - [x] Validate document access and existence
  - [x] Check for existing completed job (return jobId if recent < 1 hour)
  - [x] Create new job with `pending` status
  - [x] Generate unique jobId: `${documentId}_${Date.now()}`
  - [x] Create job: { documentId, status: 'pending', createdAt: now }
  - [x] Store in `this.conversionJobs.set(jobId, job)`
  - [x] Start async conversion in background using `setImmediate`
  - [x] Return jobId immediately
- [x] Implement `processConversionJob(jobId: string): Promise<void>` internal method
  - [x] Mark job as `processing`
  - [x] Get document details
  - [x] Build OnlyOffice conversion request with `async: true`
  - [x] POST to `${ONLYOFFICE_DOCUMENT_SERVER_URL}/converter`
  - [x] Parse response to get conversion URL
  - [x] Download PDF from conversion URL
  - [x] Save to `{UPLOAD_DEST_DIR}/{kind}/{id}/pdf/` directory
  - [x] Update job: { status: 'completed', pdfUrl: '/local/path' }
  - [x] Update DB: modifiedBy=user, modifiedAtUser=now
  - [x] Log errors and update job status to `failed`
- [x] Implement `getConversionStatus(jobId: string): ConversionJob | null` method
  - [x] Return job from Map if exists, else null
- [x] Implement `downloadConvertedPdf(documentId: string, user: User): Promise<Stream>` method
  - [x] Check for existing cached conversion (completed job)
  - [x] If cached and file exists on disk, stream it immediately
  - [x] Otherwise start new conversion (call `initiatePdfConversion`)
  - [x] Throw error with jobId for client to poll status
  - [x] Call `recordDownload` to track download activity
- [x] Implement `cleanupExpiredPdfs(): void` method (30-day TTL)
  - [x] Scan all PDF directories on startup
  - [x] For each PDF file, check mtime
  - [x] Delete files where `mtime < 30 days ago`
  - [x] Log cleanup summary
  - [x] Handle errors gracefully
  - [x] Call cleanup in DocumentsService constructor

### 1.2 Documents Controller - New Endpoints

- [x] Add `POST /documents/:id/convert-pdf` endpoint
  - [x] Roles: admin, manager, user (use same guards as download)
  - [x] Call `documentsService.initiatePdfConversion(id, user)`
  - [x] Return `{ jobId: string }` JSON response
  - [x] Add proper Swagger documentation
  - [x] Log conversion initiation
- [x] Add `GET /documents/:id/convert-status/:jobId` endpoint
  - [x] Roles: admin, manager, user
  - [x] Call `documentsService.getConversionStatus(jobId)`
  - [x] Return job status JSON: `{ status, pdfUrl, error, createdAt }`
  - [x] Handle non-existent jobs (return 404)
  - [x] Add proper Swagger documentation
- [x] Add `GET /documents/:id/download-pdf` endpoint
  - [x] Roles: admin, manager, user (use same guards as download)
  - [x] Call `documentsService.downloadConvertedPdf(id, user)`
  - [x] Stream PDF file with proper headers:
    - `Content-Type: application/pdf`
    - `Content-Disposition: attachment; filename="{documentNumber}.pdf"`
    - `Cache-Control: no-cache`
  - [x] Handle conversion in progress (return 202 with jobId)
  - [x] Handle conversion errors (return 500 with error message)
  - [x] Add proper Swagger documentation

### 1.3 OnlyOffice JWT Signing

- [x] Ensure `signOnlyOfficeConfig()` can sign conversion requests
- [x] Add JWT token to conversion request body if OnlyOffice requires it
- [x] Handle JWT validation for conversion responses

## 2. Frontend Implementation

### 2.1 Hooks - PDF Conversion

- [x] Add `useInitiatePdfConversion(documentId: string)` hook
  - [x] Use useMutation from TanStack Query
  - [x] POST to `/documents/:id/convert-pdf`
  - [x] Return jobId
  - [x] Invalidate documents query on success
- [x] Add `useConversionStatus(jobId: string)` hook
  - [x] Use useQuery from TanStack Query
  - [x] GET to `/documents/:id/convert-status/:jobId`
  - [x] Poll every 2 seconds if status is 'processing' or 'pending'
  - [x] Stop polling when status is 'completed' or 'failed'
  - [x] Set staleTime to 0
- [x] Add `useDownloadConvertedPdf(options?: { onSuccess, onError })` hook
  - [x] Use useMutation from TanStack Query
  - [x] GET to `/documents/:id/download-pdf` with blob responseType
  - [x] Trigger browser download with blob
  - [x] Invalidate documents query on success
  - [x] Handle 202 response (conversion in progress)
  - [x] Invalidate documents query on success
  - [x] Call options.onSuccess/onError callbacks

### 2.2 Types - Add Conversion Status Interface

- [x] Add `ConversionStatus` interface to `documents.types.ts`
  - [x] Fields: status, pdfUrl, error, createdAt
  - [x] Status type: 'pending' | 'processing' | 'completed' | 'failed'

### 2.3 Document Office Page - Download Buttons

- [x] Update header section to include download buttons
- [x] Add "Download Office" button (move from documents list)
  - [x] Use `useDownloadDocument` hook with `type: 'office'`
  - [x] Show FileDown icon
  - [x] Dynamic button text based on file type (Word/Excel/Office)
  - [x] Disable during download
- [x] Add "Download PDF" button
  - [x] Use `useDownloadConvertedPdf` hook
  - [x] Show FileText icon
  - [x] Button text: "下載 PDF" or "轉換中..." during conversion
  - [x] Disable during conversion
- [x] Implement conversion polling logic
  - [x] On "Download PDF" click, try direct download first
  - [x] If 202 (converting), store jobId and start polling
  - [x] Use `useConversionStatus` hook for polling
  - [x] When status is 'completed', trigger download
  - [x] Clear jobId after successful download
  - [x] Show loading spinner on button during conversion
- [x] Add helper function `getOfficeFileType(fileType: string)`
  - [x] Map docx → 'Word', xlsx → 'Excel', others → 'Office'
- [x] Add proper error handling with toast notifications
  - [x] Show success toasts: "Office 文檔下載成功", "PDF 下載成功"
  - [x] Show error toasts: "下載 Office 文檔失敗", "PDF 下載失敗"

### 2.4 Documents List Page - Remove Download Office Button

- [x] Remove "Download Office" button from all 4 tabs (first, second, third, fourth)
  - [x] Keep "開啟文檔/在線查看" button (opens office page)
  - [x] Keep "下載 PDF" button (for manually uploaded PDFs)
  - [x] Keep "編輯" button for admin/manager
  - [x] Locations: lines 296-326, 551-581, 806-836, 1061-1091
  - [x] Ensure existing "開啟文檔/在線查看" button navigates to office page

## 3. Testing & Validation

### 3.1 Backend Testing

- [x] Write unit tests for `initiatePdfConversion` method
- [x] Write unit tests for `processConversionJob` method
- [x] Write unit tests for `getConversionStatus` method
- [x] Write unit tests for `downloadConvertedPdf` method
- [x] Write e2e tests for conversion endpoints
  - [x] Test successful conversion flow
  - [x] Test conversion polling
  - [x] Test error handling (document not found, access denied)
  - [x] Test concurrent conversion requests
- [x] Test OnlyOffice JWT signing for conversion requests
- [x] Test 30-day TTL cleanup (simulate with short TTL for testing)

### 3.2 Frontend Testing

- [x] Test "Download Office" button on office page
  - [x] Verify correct file download
  - [x] Verify button states (enabled/disabled during download)
- [x] Test "Download PDF" button on office page
  - [x] Verify conversion initiation
  - [x] Verify polling behavior
  - [x] Verify auto-download on completion
  - [x] Verify error handling
- [x] Test conversion status polling
  - [x] Verify 2-second interval
  - [x] Verify stops on completion/failure
- [x] Test UI feedback (loading states, toasts)
- [x] Test various file types (docx, xlsx, pptx)

### 3.3 Integration Testing

- [x] Test full conversion flow end-to-end
  - User opens office page
  - User clicks "Download PDF"
  - Conversion completes
  - PDF downloads automatically
- [x] Test re-conversion scenario
  - Download PDF twice (second should be faster or cached)
- [x] Test with different user roles
  - Admin: can download Office and PDF
  - Manager: can download Office and PDF
  - User: can download PDF only
- [x] Test document access control
  - Verify users can't convert documents they don't have access to

## 4. Documentation & Deployment

### 4.1 Documentation

- [x] Update API documentation with new endpoints
- [x] Document 30-day TTL cleanup behavior
- [x] Update frontend component documentation
- [x] Add conversion troubleshooting guide to README

### 4.2 Deployment

- [x] Verify OnlyOffice Document Server URL is configured
- [x] Verify OnlyOffice JWT secret is configured
- [x] Test conversion in production environment
- [x] Monitor conversion performance and error rates
