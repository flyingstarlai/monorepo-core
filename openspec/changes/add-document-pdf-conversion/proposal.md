## Why

The current OnlyOffice integration allows users to view and edit Office documents online, but lacks the ability to download documents in PDF format. This is a critical gap because:

1. Many users prefer PDF for archival and sharing purposes
2. PDF provides consistent formatting across different devices/viewers
3. Existing "Download PDF" button only works if PDF was manually uploaded with the Office file

Adding on-demand PDF conversion using OnlyOffice's Conversion API will enable users to export any Office document to PDF with a single click, improving document portability and sharing capabilities.

## What Changes

- Add backend async conversion job tracking using in-memory storage (no database column needed)
- Expose `POST /documents/:id/convert-pdf` endpoint to initiate conversion
- Expose `GET /documents/:id/convert-status/:jobId` endpoint for polling conversion status
- Expose `GET /documents/:id/download-pdf` endpoint to download converted PDF
- Convert documents using OnlyOffice Document Server's async Conversion API
- Always reconvert from latest Office file (ignore existing `pdfFilePath` column)
- Store converted PDFs temporarily in filesystem without database persistence
- Move "Download Office" button from documents list page to OnlyOffice viewer page (`/documents/:id/office`)
- Add "Download PDF" button to OnlyOffice viewer page with conversion progress feedback
- Implement frontend polling for conversion status with auto-download on completion

## Impact

- **Specs affected**: Updates `documents` capability to add PDF conversion scenarios
- **Backend code**: `apps/api/src/documents/*` (controller/service) - adds 3 new endpoints and conversion logic
- **Frontend code**:
  - `apps/web/src/features/documents/hooks/use-documents.ts` - adds 3 new hooks
  - `apps/web/src/features/documents/types/documents.types.ts` - adds ConversionStatus interface
  - `apps/web/src/features/documents/pages/document-office.page.tsx` - adds download buttons and conversion logic
  - `apps/web/src/features/documents/pages/documents.page.tsx` - removes Download Office button (4 locations)
- **Database**: No schema changes required (`pdfFilePath` column ignored)
- **External dependencies**: Uses existing OnlyOffice Document Server with Conversion API
- **Performance**: Async conversion with polling ensures non-blocking UI; PDFs cached in filesystem until server restart
- **Security**: Respects existing document access control and role-based permissions
