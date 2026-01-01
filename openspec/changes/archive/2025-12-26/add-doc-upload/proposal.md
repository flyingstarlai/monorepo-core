## Why

Admins and managers need a centralized way to publish official documents (procedures, forms, policies) in Word/Excel format plus PDF, with strict role-based control over who can upload and who can download the editable sources. Today these files are distributed ad-hoc, making it hard to ensure users see the latest versions and maintain an audit trail.

## What Changes

- Add a "Document Center" feature gated behind `FEATURE_DOC_UPLOAD` to manage official documents.
- Define a document metadata table logically equivalent to `IDOCCTRL` with fields for document kind, code, name, current version, Office file reference (Word/Excel), PDF file reference, and audit fields (creator, created date, last modifier, modified date, last downloader, last download date).
- Provide API endpoints for listing documents, uploading new documents, updating existing entries, and downloading files.
- Enforce role-based behavior: admins and managers can upload or replace documents; admins can edit Office documents in-place; managers can DOWNLOAD but NOT EDIT both Office (Word/Excel) and PDF; regular users can only download PDF version.
- Track and persist last downloader and last download timestamp whenever a document is downloaded.
- Add a Web UI page for admins/managers to upload and manage documents, and a read-only listing for regular users with download buttons aligned to their permissions.
- Feature flag: `FEATURE_DOC_UPLOAD` must gate both API module registration and frontend routes so the feature can be turned off in some environments.
- Affected specs: documents
- Affected code: API (new documents module, DTOs, service, controller, entity mapped to an `IDOCCTRL`-style table); Web (new "Documents" page and navigation entry, upload form, document list + downloads); Auth/roles (use existing role/guard plumbing).
- Feature flag: `FEATURE_DOC_UPLOAD` must gate both API module registration and frontend routes so the feature can be turned off in some environments.
- Provide API endpoints for listing documents, uploading new documents, updating existing entries, and downloading files.
- Enforce role-based behavior: admins and managers can upload or replace documents; managers can DOWNLOAD but NOT EDIT both Office (Word/Excel) and PDF; regular users can only download PDF version.
- Track and persist last downloader and last download timestamp whenever a document is downloaded.
- Add a Web UI page for admins/managers to upload and manage documents, and a read-only listing for regular users with download buttons aligned to their permissions.

## Impact

- Affected specs: documents
- Affected code: API (new documents module, DTOs, service, controller, entity mapped to an `IDOCCTRL`-style table); Web (new "Documents" page and navigation entry, upload form, document list + downloads); Auth/roles (use existing role/guard plumbing).
- Feature flag: `FEATURE_DOC_UPLOAD` must gate both API module registration and frontend routes so the feature can be turned off in some environments.
