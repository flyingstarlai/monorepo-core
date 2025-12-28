## 1. Backend Implementation

### 1.1 Documents Service - Conversion Job Tracking

- [ ] Add `ConversionJob` interface with fields: documentId, status, pdfUrl, error, createdAt
- [ ] Add in-memory `conversionJobs` Map storage to DocumentsService
- [ ] Implement `initiatePdfConversion(documentId: string, user: User): Promise<string>` method
  - Validate document access and existence
  - Check for existing completed job (return jobId if recent < 1 hour)
  - Create new job with `pending` status
  - Generate unique jobId: `${documentId}_${Date.now()}`
  - Start async conversion in background using `setImmediate`
  - Return jobId immediately
- [ ] Implement `processConversionJob(jobId: string): Promise<void>` internal method
  - Mark job as `processing`
  - Get document details
  - Build OnlyOffice conversion request with `async: true`
  - POST to `${ONLYOFFICE_DOCUMENT_SERVER_URL}/converter`
  - Parse response to get conversion URL
  - Download PDF from conversion URL
  - Save to `{UPLOAD_DEST_DIR}/{kind}/{id}/pdf/` directory
  - Update job status to `completed` with local pdf file path
  - Update document `modifiedBy` and `modifiedAtUser` in database
  - Log errors and update job status to `failed`
- [ ] Implement `getConversionStatus(jobId: string): ConversionJob | null` method
  - Return job from Map if exists, else null
- [ ] Implement `downloadConvertedPdf(documentId: string, user: User): Promise<Stream>` method
  - Check for existing cached conversion (completed job)
  - If cached and file exists on disk, stream it immediately
  - Otherwise start new conversion (call `initiatePdfConversion`)
  - Throw error with jobId for client to poll status
  - Call `recordDownload` to track download activity

### 1.2 Documents Controller - New Endpoints

- [ ] Add `POST /documents/:id/convert-pdf` endpoint
  - Roles: admin, manager, user (use same guards as download)
  - Call `documentsService.initiatePdfConversion(id, user)`
  - Return `{ jobId: string }` JSON response
  - Add proper Swagger documentation
  - Log conversion initiation
- [ ] Add `GET /documents/:id/convert-status/:jobId` endpoint
  - Roles: admin, manager, user
  - Call `documentsService.getConversionStatus(jobId)`
  - Return job status JSON: `{ status, pdfUrl, error, createdAt }`
  - Handle non-existent jobs (return 404)
  - Add proper Swagger documentation
- [ ] Add `GET /documents/:id/download-pdf` endpoint
  - Roles: admin, manager, user (use same guards as download)
  - Call `documentsService.downloadConvertedPdf(id, user)`
  - Stream PDF file with proper headers:
    - `Content-Type: application/pdf`
    - `Content-Disposition: attachment; filename="{documentNumber}.pdf"`
    - `Cache-Control: no-cache`
  - Handle conversion in progress (return 202 with jobId)
  - Handle conversion errors (return 500 with error message)
  - Add proper Swagger documentation

### 1.3 OnlyOffice JWT Signing

- [ ] Ensure `signOnlyOfficeConfig()` can sign conversion requests
- [ ] Add JWT token to conversion request body if OnlyOffice requires it
- [ ] Handle JWT validation for conversion responses

## 2. Frontend Implementation

### 2.1 Hooks - PDF Conversion

- [ ] Add `useInitiatePdfConversion(documentId: string)` hook
  - Use useMutation from TanStack Query
  - POST to `/documents/:id/convert-pdf`
  - Return jobId
- [ ] Add `useConversionStatus(jobId: string)` hook
  - Use useQuery from TanStack Query
  - GET to `/documents/:id/convert-status/:jobId`
  - Poll every 2 seconds if status is 'processing' or 'pending'
  - Stop polling when status is 'completed' or 'failed'
- [ ] Add `useDownloadConvertedPdf(options?: { onSuccess, onError })` hook
  - Use useMutation from TanStack Query
  - GET to `/documents/:id/download-pdf` with blob responseType
  - Trigger browser download with blob
  - Invalidate documents query on success

### 2.2 Types - Add Conversion Status Interface

- [ ] Add `ConversionStatus` interface to `documents.types.ts`
  - Fields: status, pdfUrl, error, createdAt
  - Status type: 'pending' | 'processing' | 'completed' | 'failed'

### 2.3 Document Office Page - Download Buttons

- [ ] Update header section to include download buttons
- [ ] Add "Download Office" button (move from documents list)
  - Use `useDownloadDocument` hook with `type: 'office'`
  - Show FileDown icon
  - Dynamic button text based on file type (Word/Excel/Office)
  - Disable during download
- [ ] Add "Download PDF" button
  - Use `useDownloadConvertedPdf` hook
  - Show FileText icon
  - Button text: "下載 PDF" or "轉換中..." during conversion
  - Disable during conversion
  - Auto-download when conversion completes
- [ ] Implement conversion polling logic
  - On "Download PDF" click, try direct download first
  - If 202 (converting), store jobId and start polling
  - Use `useConversionStatus` hook for polling
  - When status is 'completed', trigger download
  - Clear jobId after successful download
  - Show loading spinner on button during conversion
- [ ] Add helper function `getOfficeFileType(fileType: string)`
  - Map docx → 'Word', xlsx → 'Excel', others → 'Office'
- [ ] Add proper error handling with toast notifications
  - Show success toasts: "Office 文檔下載成功", "PDF 下載成功"
  - Show error toasts: "下載 Office 文檔失敗", "PDF 下載失敗"
  - Handle conversion failures gracefully

### 2.4 Documents List Page - Remove Download Office Button

- [ ] Remove "Download Office" button from all 4 tabs (first, second, third, fourth)
  - Keep "開啟文檔/在線查看" button (opens office page)
  - Keep "下載 PDF" button (for manually uploaded PDFs)
  - Keep "編輯" button for admin/manager
  - Locations: lines 296-326, 551-581, 806-836, 1061-1091
- [ ] Ensure existing "開啟文檔/在線查看" button navigates to office page

## 3. Testing & Validation

### 3.1 Backend Testing

- [ ] Write unit tests for `initiatePdfConversion` method
- [ ] Write unit tests for `processConversionJob` method
- [ ] Write unit tests for `getConversionStatus` method
- [ ] Write unit tests for `downloadConvertedPdf` method
- [ ] Write e2e tests for conversion endpoints
  - Test successful conversion flow
  - Test conversion polling
  - Test error handling (document not found, access denied)
  - Test concurrent conversion requests
- [ ] Test OnlyOffice JWT signing for conversion requests

### 3.2 Frontend Testing

- [ ] Test "Download Office" button on office page
  - Verify correct file download
  - Verify button states (enabled/disabled during download)
- [ ] Test "Download PDF" button on office page
  - Verify conversion initiation
  - Verify polling behavior
  - Verify auto-download on completion
  - Verify error handling
- [ ] Test conversion status polling
  - Verify 2-second interval
  - Verify stops on completion/failure
- [ ] Test UI feedback (loading states, toasts)
- [ ] Test various file types (docx, xlsx, pptx)

### 3.3 Integration Testing

- [ ] Test full conversion flow end-to-end
  - User opens office page
  - User clicks "Download PDF"
  - Conversion completes
  - PDF downloads automatically
- [ ] Test re-conversion scenario
  - Download PDF twice (second should be faster or cached)
- [ ] Test with different user roles
  - Admin: can download Office and PDF
  - Manager: can download Office and PDF
  - User: can download PDF only
- [ ] Test document access control
  - Verify users can't convert documents they don't have access to

## 4. Documentation & Deployment

### 4.1 Documentation

- [ ] Update API documentation with new endpoints
- [ ] Update frontend component documentation
- [ ] Add conversion troubleshooting guide to README

### 4.2 Deployment

- [ ] Verify OnlyOffice Document Server URL is configured
- [ ] Verify OnlyOffice JWT secret is configured
- [ ] Test conversion in production environment
- [ ] Monitor conversion performance and error rates
