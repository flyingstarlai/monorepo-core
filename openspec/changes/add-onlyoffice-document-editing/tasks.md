## 1. Backend OnlyOffice Integration

- [ ] 1.1 Add `ONLYOFFICE_DOCUMENT_SERVER_URL` and `ONLYOFFICE_JWT_SECRET` to `apps/api/.env.example` and wire them into configuration.
- [ ] 1.2 Implement a documents service helper to build OnlyOffice config JSON for a given document ID, including document URL, key, user info, and permissions.
- [ ] 1.3 Ensure the OnlyOffice document URL reuses the existing `/documents/:id/download?type=office` endpoint.
- [ ] 1.4 Implement a new controller endpoint (e.g. `GET /documents/:id/office`) that validates access, loads the document, builds the OnlyOffice config, signs it with JWT, and returns it.
- [ ] 1.5 Implement an OnlyOffice callback endpoint (e.g. `POST /documents/:id/office/callback`) that validates the OnlyOffice JWT, handles status codes, downloads updated content from OnlyOffice if needed, and writes it back to the existing office file path.
- [ ] 1.6 Add role checks so only `admin` and `manager` get edit permissions; `user` is forced to view-only.
- [ ] 1.7 Add tests for the config builder and access control logic.

## 2. Frontend OnlyOffice Integration

- [ ] 2.1 Add a frontend API helper/hook (e.g. `useDocumentOfficeConfig`) that calls `/documents/:id/office` and returns the OnlyOffice config.
- [ ] 2.2 Create a new route file `apps/web/src/routes/_authenticated/documents.$id.office.tsx` that renders a `DocumentOfficePage`.
- [ ] 2.3 Implement `DocumentOfficePage` to load the config, handle loading/error states, and render an iframe pointing to the OnlyOffice Document Server editor URL with the signed config.
- [ ] 2.4 Wire role-based behavior in the UI (e.g. hide edit affordances for users if backend returns view-only mode).
- [ ] 2.5 Add a button in the documents list/table (`DocumentsPage`) to navigate to `/documents/$id/office` for the selected document.

## 3. Validation & Documentation

- [ ] 3.1 Add or update tests covering the `/documents/:id/office` and callback endpoints.
- [ ] 3.2 Verify that admin/manager can edit and users get read-only mode by exercising the flow manually.
- [ ] 3.3 Update any relevant developer documentation to describe OnlyOffice env vars, deployment requirements, and the new routes.
