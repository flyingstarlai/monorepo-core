## 1. Implementation

- [x] 1.1 Design DB schema / entity for documents (map to `IDOCCTRL` columns or adjusted names) and add migration.
- [x] 1.2 Implement NestJS documents module (entity, repository, service, controller) with endpoints:
  - [x] 1.2.1 List documents with basic filters.
  - [x] 1.2.2 Upload/create document (Office + optional PDF).
  - [x] 1.2.3 Update/replace existing document/version.
  - [x] 1.2.4 Download endpoints enforcing file-type permissions.
- [x] 1.3 Integrate file storage (e.g., local filesystem or MinIO) and wire to Office/PDF reference fields.
- [x] 1.4 Add feature flag `FEATURE_DOC_UPLOAD` in API (module inclusion and guards) and Web (routes/nav).
- [x] 1.5 Implement React "Documents" UI: listing, upload form for admin/manager, downloads for all roles.
- [x] 1.6 Wire role-based behavior in UI and API (only admin/manager can upload; manager vs regular user download differences).
- [x] 1.7 Track audit fields (creator, modifier, last downloader and timestamps) on upload/update/download.
- [x] 1.8 Add tests (API + minimal UI) for upload, download, and permissions.

## 2. Validation

- [x] 2.1 `openspec validate add-doc-upload --strict` passes.
- [x] 2.2 API e2e tests for document upload and download permissions pass.
- [x] 2.3 Manual QA: verify feature flag off hides API module and UI.
