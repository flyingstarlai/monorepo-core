## Context

The ACM Document Center already supports uploading and downloading Office (DOCX/XLSX) and PDF files via the `documents` module. However, editing Office documents currently requires a download → local edit → re-upload flow.

We want to integrate OnlyOffice Document Server to enable online viewing and editing of Office documents based on the existing `DocumentsEntity.officeFilePath` storage, while preserving role-based access control (admin/manager/user) and using JWT for secure communication with the Document Server.

## Goals / Non-Goals

- **Goals**
  - Provide a `/documents/:id/office` flow that opens a document in OnlyOffice with proper permissions.
  - Reuse existing document storage and access control logic from the `documents` module.
  - Use environment-driven configuration for OnlyOffice URL and JWT secret.
  - Support an OnlyOffice callback to persist edits back to the stored Office file.
- **Non-Goals**
  - Implement full document versioning/history (beyond what is already stored).
  - Support arbitrary external document sources beyond existing local/minio storage.
  - Replace the existing upload/download endpoints.

## Decisions

- **OnlyOffice configuration**
  - Use `ONLYOFFICE_DOCUMENT_SERVER_URL` as the base URL for the OnlyOffice Document Server.
  - Build a config object containing `document`, `editorConfig`, and `permissions`, following OnlyOffice standard structure.
  - Use the existing `/documents/:id/download?type=office` endpoint as the `document.url` so OnlyOffice can fetch the file content.
  - Use `DocumentsEntity.officeFilePath` as the backing file; do not introduce a new storage path.

- **JWT Integration**
  - Use `ONLYOFFICE_JWT_SECRET` (separate from the main JWT secret) to sign the OnlyOffice config payload.
  - Use NestJS `JwtService` or `jsonwebtoken` directly to create a token that wraps the config or appropriate sub-parts according to OnlyOffice’s JWT schema.
  - Validate the JWT on the OnlyOffice callback endpoint before accepting any edits.

- **Access Control**
  - Reuse existing `JwtAuthGuard` and `RolesGuard` on the `/documents/:id/office` config endpoint.
  - Determine `canEdit` based on `user.role`:
    - `admin` → edit mode enabled (`editorConfig.mode = "edit"`, `permissions.edit = true`).
    - `manager`, `user` → view-only (`editorConfig.mode = "view"`, `permissions.edit = false`).
  - Reuse existing `DocumentsService.canAccessDocument` logic to ensure the document’s `documentAccessLevel` is respected.

- **Callback Handling**
  - Implement `POST /documents/:id/office/callback` as the OnlyOffice callback URL.
  - For save-complete statuses, fetch the updated file from the URL provided by OnlyOffice (or from the callback payload) and overwrite the existing Office file on disk/MinIO.
  - Optionally update metadata such as `modifiedBy` and `modifiedAtUser` on successful save.

- **Frontend Integration**
  - The React web app will call `/documents/:id/office` to get the signed config and/or token.
  - The frontend will use the official OnlyOffice React component (`@onlyoffice/document-editor-react`) and its `<DocumentEditor>` component instead of manually embedding an iframe.
  - `DocumentEditor` will receive `documentServerUrl` and a `config` object (including the JWT token, if required by the OnlyOffice Docs configuration) that is built on the backend, following the [OnlyOffice React integration guide](https://api.onlyoffice.com/docs/docs-api/get-started/frontend-frameworks/react/).
  - The route `/documents/$id/office` will be protected on the frontend by the existing auth flow but trust the backend for final permission decisions.

## Risks / Trade-offs

- **Risk**: Misconfiguration of OnlyOffice URL or JWT secret may result in errors when loading the editor.
  - **Mitigation**: Validate env vars at startup and log explicit configuration errors.

- **Risk**: Network/connectivity issues between the Document Server and the API may cause save failures.
  - **Mitigation**: Implement clear error logging, and surface appropriate error messages in the UI.

- **Risk**: Using the existing download endpoint as `document.url` assumes the response format is compatible with OnlyOffice expectations.
  - **Mitigation**: Adjust headers or add a dedicated read-only file-serving endpoint if needed, but start with reusing the existing one to minimize changes.

## Migration Plan

1. Add OnlyOffice env vars and configuration wiring (no functional change for existing features).
2. Implement the backend OnlyOffice config endpoint and callback, behind existing auth/role guards.
3. Implement the frontend route and button, but hide or feature-flag the button until OnlyOffice is deployed.
4. Deploy an OnlyOffice Document Server instance and configure env vars in each environment.
5. Test the full flow with admin, manager, and user roles.

## Open Questions

- Should we store additional version metadata (e.g. OnlyOffice version key) for auditing purposes?
- Do we need to support collaborative editing features (multiple editors) or keep it single-user for now?
- Should the OnlyOffice integration be feature-flagged (similar to `FEATURE_DOC_UPLOAD`) via a new env flag?
