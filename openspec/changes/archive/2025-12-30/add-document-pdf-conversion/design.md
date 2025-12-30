## Context

The Document Center currently integrates OnlyOffice for online viewing and editing of Office documents. Users can manually upload both Office and PDF files, but cannot automatically convert Office files to PDF format. This limitation creates friction for users who need PDF versions for archival, sharing, or offline viewing on devices without Office software.

The existing system has:

- Office file viewing/editing via OnlyOffice Document Server
- Manual PDF upload support (separate field in database)
- Download Office button on documents list page (admin/manager only)
- Download PDF button on documents list page (if PDF was manually uploaded)

Users have requested:

- On-demand PDF conversion from Office files
- Consolidated download options in the office viewer page
- Always generate PDF from latest Office version (ignore cached uploads)

## Goals / Non-Goals

### Goals

- Enable on-demand PDF conversion using OnlyOffice's Conversion API
- Provide real-time conversion progress feedback to users
- Move Office file download to the office viewer page for better UX
- Always reconvert from latest Office file (ensure data freshness)
- Use async conversion API to prevent UI blocking
- Cache converted PDFs temporarily without database persistence

### Non-Goals

- Store converted PDF paths in database (pdfFilePath column ignored)
- Batch conversion of multiple documents
- Scheduled/conversion on document upload
- Conversion history tracking beyond current session
- Persistent job storage across server restarts

## Decisions

### Decision 1: In-Memory Job Tracking vs Database Storage

**Decision**: Use in-memory Map for conversion job tracking instead of database table.

**Rationale**:

- Simpler implementation - no database migration needed
- Job lifecycle is short-lived (typically < 2 minutes)
- No long-term job history requirement
- System already uses `pdfFilePath` column (which we're ignoring)
- Avoids schema changes and data migration complexity

**Alternatives considered**:

1. **Database table** (`TC_APP_DOC_CONVERSION_JOBS`): Would provide persistent tracking across restarts and job history, but requires migration and adds complexity. Rejected as over-engineering for short-lived jobs.
2. **Redis/distributed cache**: Would support multiple API instances and job persistence, but adds new infrastructure dependency. Rejected as system currently has single-instance deployment.
3. **Filesystem-based tracking** (lock files): Simple and persistent, but prone to race conditions and stale file cleanup issues. Rejected as less reliable than in-memory tracking.

**Trade-offs**:

- **Pro**: No database changes, simpler code, automatic cleanup on restart
- **Con**: Jobs lost on server restart, no job history/debugging
- **Mitigation**: Conversions are fast (< 2 min typical), restarts are infrequent in production, users can re-convert if needed

### Decision 2: Async Conversion API with Polling vs Sync Conversion

**Decision**: Use OnlyOffice's async Conversion API with frontend polling.

**Rationale**:

- Non-blocking UX - users can continue using the app during conversion
- Better for large files that may take > 30 seconds to convert
- Provides real-time progress feedback via status polling
- Aligns with user request for async conversion
- Prevents HTTP timeouts on long-running conversions

**Alternatives considered**:

1. **Sync conversion**: Simpler code, one request-response. Rejected because large files would cause browser timeout and no progress feedback.
2. **Webhook callbacks**: OnlyOffice would notify when conversion complete. Rejected because our OnlyOffice integration doesn't currently support webhooks, adds infrastructure complexity.
3. **Server-Sent Events (SSE)**: Real-time progress updates. Rejected because OnlyOffice API doesn't provide SSE support, adds complexity.

**Trade-offs**:

- **Pro**: Better UX, handles large files, no timeout issues
- **Con**: More complex frontend logic (polling, state management), multiple HTTP requests
- **Mitigation**: Use TanStack Query's refetchInterval for clean polling implementation

### Decision 3: Filesystem-Only PDF Storage vs Database Path Tracking

**Decision**: Store converted PDFs only in filesystem without updating `pdfFilePath` column.

**Rationale**:

- Always reconvert from latest Office file (user requirement)
- No database state to maintain (simpler code)
- Automatic cleanup on server restarts (no stale files)
- User-specified requirement: "dont need pdfPath column in document entity"
- Simplifies deployment (no migration needed)

**Alternatives considered**:

1. **Update pdfFilePath column**: Would enable persistent caching but requires reconvert-on-change logic. Rejected per user feedback and complexity.
2. **Cache with TTL**: Store PDFs with expiration (e.g., 24 hours). Rejected as over-complicated for this use case.
3. **Ephemeral storage only**: Store in temp directory, delete after download. Rejected as prevents multiple downloads of same conversion.

**Trade-offs**:

- **Pro**: Always fresh PDF from latest Office file, simpler data model, no migration
- **Con**: PDFs lost on restart, no cross-session caching, repeated conversions waste OnlyOffice resources
- **Mitigation**: Server restarts are infrequent; conversions are fast; users can re-convert if needed

### Decision 4: Move Download Office Button to Office Page

**Decision**: Remove "Download Office" button from documents list and add it to the office viewer page.

**Rationale**:

- Consolidates all document operations in one place (office page)
- Cleaner documents list (reduces button clutter)
- Better UX - users download when viewing, not when browsing list
- Aligns with "Download PDF" being added to office page
- Reduces duplicate UI patterns

**Alternatives considered**:

1. **Keep button in both places**: Redundant but maintains current pattern. Rejected as violates DRY principle and adds UI clutter.
2. **Only in documents list**: Users would need to navigate back to download Office file. Rejected as poor UX.
3. **Context menu dropdown**: Download options in overflow menu. Rejected as less discoverable and harder to implement.

**Trade-offs**:

- **Pro**: Cleaner UI, consolidated operations, better UX
- **Con**: One extra click to download Office file (open page → download)
- **Mitigation**: Office page is the natural place to download when viewing/editing

### Decision 5: Polling Interval and Timeout

**Decision**: Poll conversion status every 2 seconds, timeout after 5 minutes.

**Rationale**:

- 2 seconds provides responsive UX without overloading server
- 5 minutes is generous timeout (typical conversions < 30 seconds, large files < 2 minutes)
- Balances responsiveness and server load
- Prevents infinite polling if job is stuck

**Alternatives considered**:

1. **1 second interval**: More responsive but higher server load. Rejected as unnecessary overhead.
2. **5 second interval**: Lower load but sluggish UX. Rejected as poor user experience.
3. **Exponential backoff**: 1s, 2s, 4s, 8s... Efficient but complex implementation. Rejected as over-engineering.

**Trade-offs**:

- **Pro**: Responsive feedback, reasonable server load, fails gracefully
- **Con**: Fixed timeout might be too short for very large files
- **Mitigation**: 5 minutes is generous for typical document sizes (< 10MB); can be adjusted if needed

## Risks / Trade-offs

### Risk 1: OnlyOffice Server Unavailability

**Risk**: If OnlyOffice Document Server is down or unreachable, all PDF conversions fail.

**Impact**: Users cannot download PDFs from Office files, only manually uploaded PDFs work.

**Mitigation**:

- Add proper error handling with clear messages
- Show toast: "轉換服務暫時無法使用，請稍後再試" (Conversion service temporarily unavailable, please try again later)
- Log errors for monitoring
- Consider adding health check endpoint for OnlyOffice

### Risk 2: Conversion Queue Overload

**Risk**: Multiple users requesting simultaneous conversions could overload OnlyOffice server.

**Impact**: Slow conversions or timeouts for some users.

**Mitigation**:

- OnlyOffice has built-in queue management
- System limits to one conversion per document at a time (same jobId logic)
- Consider adding rate limiting in future if needed
- Monitor conversion success rate

### Risk 3: Filesystem Storage Accumulation

**Risk**: PDFs accumulate in filesystem without cleanup mechanism.

**Impact**: Disk space usage grows over time, eventually fills storage.

**Mitigation**:

- PDFs lost on server restart (automatic cleanup)
- Add note to operations documentation to occasionally clean temp directories
- Consider adding scheduled cleanup job in future (e.g., delete PDFs older than 24 hours)
- Monitor disk usage

### Risk 4: In-Memory Job Loss on Restart

**Risk**: Server restart causes active conversion jobs to be lost.

**Impact**: Users with pending conversions will need to re-click download button.

**Mitigation**:

- Server restarts are infrequent in production
- Restart notification can inform users to retry
- Conversion is fast (< 2 min), window of exposure is small
- Document this behavior in user-facing documentation

### Risk 5: Race Condition - Multiple Concurrent Conversions

**Risk**: Two users request conversion of same document simultaneously.

**Impact**: Duplicate conversions waste OnlyOffice resources, possible overwrites.

**Mitigation**:

- Job ID includes timestamp: `${documentId}_${Date.now()}`
- Check for existing job before starting new conversion
- Return existing jobId if recent job (< 1 hour)
- Consider adding lock mechanism in future if needed

## Migration Plan

### Database Migration

**No migration required** - we are not using `pdfFilePath` column for converted PDFs.

### API Changes

**New Endpoints**:

1. `POST /documents/:id/convert-pdf` - Initiates conversion
2. `GET /documents/:id/convert-status/:jobId` - Polls conversion status
3. `GET /documents/:id/download-pdf` - Downloads converted PDF

**Existing Endpoints**:

- `GET /documents/:id/download?type=office` - Unchanged
- `GET /documents/:id/office` - Unchanged
- `POST /documents/:id/office/callback` - Unchanged

### Frontend Changes

**New Routes**:

- None (using existing `/documents/:id/office` route)

**Modified Components**:

- `document-office.page.tsx` - Add download buttons and conversion logic
- `documents.page.tsx` - Remove Download Office button (4 tabs)

**New Hooks**:

- `useInitiatePdfConversion`
- `useConversionStatus`
- `useDownloadConvertedPdf`

### Rollback Plan

If issues arise:

1. Remove new endpoints from backend
2. Revert `document-office.page.tsx` to previous state (remove download buttons)
3. Restore "Download Office" button in `documents.page.tsx` (4 tabs)
4. Delete in-memory job tracking code
5. No database changes to rollback

### Deployment Steps

1. Deploy backend code with new conversion logic
2. Deploy frontend code with new download buttons
3. Verify OnlyOffice Document Server is accessible
4. Verify OnlyOffice JWT secret is configured
5. Test conversion flow with a sample document
6. Monitor logs for conversion errors
7. Monitor filesystem storage usage

## Open Questions

1. **Cache Duration**: Should we cache converted PDFs for 1 hour or allow them to persist until server restart?
   - Current plan: Persist until server restart (no TTL)
   - Alternative: Implement 24-hour TTL with cleanup job

2. **Conversion Timeout**: Is 5 minutes sufficient timeout? Very large files (> 50MB) might take longer.
   - Current plan: 5 minutes timeout
   - Alternative: Configurable timeout via environment variable

3. **Error Retry**: Should we allow automatic retry on conversion failure?
   - Current plan: Manual retry (user clicks button again)
   - Alternative: Auto-retry up to 3 times with exponential backoff

4. **Storage Location**: Should PDFs be stored in a dedicated temp directory or alongside uploaded files?
   - Current plan: `{UPLOAD_DEST_DIR}/{kind}/{id}/pdf/{id}.pdf`
   - Alternative: `/tmp/pdf-conversions/{jobId}.pdf` (isolated temp storage)

5. **Large File Handling**: Should we use async conversion for all files or only files > 5MB?
   - Current plan: Always use async conversion
   - Alternative: Sync for small files (< 5MB), async for large files
