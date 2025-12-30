## 1. Backend OnlyOffice Integration

- [x] 1.1 Add `ONLYOFFICE_DOCUMENT_SERVER_URL` and `ONLYOFFICE_JWT_SECRET` to `apps/api/.env.example` and wire them into configuration.
- [x] 1.2 Implement a documents service helper to build OnlyOffice config JSON for a given document ID, including document URL, key, user info, and permissions.
- [x] 1.3 Ensure OnlyOffice document URL reuses existing `/documents/:id/download?type=office` endpoint.
- [x] 1.4 Implement a new controller endpoint (e.g. `GET /documents/:id/office`) that validates access, loads document, builds OnlyOffice config, signs it with JWT, and returns it.
- [x] 1.5 Implement an OnlyOffice callback endpoint (e.g. `POST /documents/:id/office/callback`) that validates OnlyOffice JWT, handles status codes, downloads updated content from OnlyOffice if needed, and writes it back to existing office file path.
- [x] 1.6 Add role checks so only `admin` and `manager` get edit permissions; `user` is forced to view-only.
- [x] 1.7 Add tests for config builder and access control logic.

## 2. Frontend OnlyOffice Integration

- [x] 2.1 Add a frontend API helper/hook (e.g. `useDocumentOfficeConfig`) that calls `/documents/:id/office` and returns a OnlyOffice config.
- [x] 2.2 Add `@onlyoffice/document-editor-react` as a dependency in a web app.
- [x] 2.3 Create a new route file `apps/web/src/routes/_authenticated/documents.$id.office.tsx` that renders a `DocumentOfficePage`.
- [x] 2.4 Implement `DocumentOfficePage` as a React component that uses `<DocumentEditor>` from `@onlyoffice/document-editor-react`, passing in `documentServerUrl` and a backend-provided config according to OnlyOffice React integration guide.
- [x] 2.5 Wire role-based behavior in the UI (e.g. React component reflects edit vs view-only mode from backend config rather than duplicating role logic on the client).
- [x] 2.6 Add a button in the documents list/table (`DocumentsPage`) to navigate to `/documents/$id/office` for the selected document.