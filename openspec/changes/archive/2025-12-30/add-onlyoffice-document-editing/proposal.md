## Why

The current Document Center allows users to upload and download Office/PDF files, but there is no way to view or edit Office documents directly in the browser. This forces users to download files, edit them locally, and re-upload, which is slow, error-prone, and hard to audit.

Integrating OnlyOffice Document Server will enable secure, role-based online viewing and editing of existing Office files stored by the Documents module, improving usability and keeping the single source of truth in the ACM system.

## What Changes

- Add backend configuration and environment variables for OnlyOffice Document Server and its JWT secret.
- Expose a backend endpoint (e.g. `GET /documents/:id/office`) that returns a signed OnlyOffice configuration JSON for a specific document.
- Configure the OnlyOffice document URL to reuse the existing document download endpoint for the Office file.
- Implement role-based permissions in the OnlyOffice config so that admins can edit, while managers and regular users get read-only view.
- Implement an OnlyOffice callback endpoint to receive save events and persist updated Office files back to the existing document storage.
- Add a new frontend route `/documents/$id/office` that renders the OnlyOffice editor/viewer using the official React component (`@onlyoffice/document-editor-react`).
- Add a button from the documents list/table to open the selected document in the OnlyOffice route.

## Impact

- **Specs affected**: Introduces a new `documents` capability spec for the Document Center OnlyOffice integration.
- **Backend code**: `apps/api/src/documents/*` (controller/service), configuration/env handling, and potential helper utilities for OnlyOffice JWT and callback processing.
- **Frontend code**: `apps/web/src/routes/_authenticated/documents.*.tsx`, `apps/web/src/features/documents/hooks/use-documents.ts`, and new Office-view page.
- **Security**: Adds OnlyOffice JWT signing/verification; must reuse existing NestJS JWT library and store secrets via environment variables.
- **Operations**: Requires deploying and configuring an OnlyOffice Document Server instance reachable by the API and web clients.
