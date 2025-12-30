## ADDED Requirements

### Requirement: Document Center OnlyOffice Integration

The system SHALL integrate OnlyOffice Document Server to allow online viewing and editing of Office documents stored in the Document Center, with behavior controlled by user roles and document access levels, and SHALL use the official OnlyOffice Docs React component for embedding the editor in the web UI.

#### Scenario: Admin edits document online

- **WHEN** an authenticated user with role `admin` opens `/documents/{id}/office`
- **AND** the document exists and is accessible by that user
- **THEN** the system SHALL return an OnlyOffice configuration that opens the document in edit mode
- **AND** the user SHALL be able to modify and save the document via OnlyOffice.

#### Scenario: Manager edits document online

- **WHEN** an authenticated user with role `manager` opens `/documents/{id}/office`
- **AND** the document exists and is accessible by that user
- **THEN** the system SHALL return an OnlyOffice configuration that opens the document in edit mode
- **AND** the user SHALL be able to modify and save the document via OnlyOffice.

#### Scenario: Regular user views document read-only

- **WHEN** an authenticated user with role `user` opens `/documents/{id}/office`
- **AND** the document exists and is accessible by that user
- **THEN** the system SHALL return an OnlyOffice configuration that opens the document in view-only mode
- **AND** the user SHALL NOT be allowed to save edits via OnlyOffice.

#### Scenario: Enforce document access level

- **WHEN** any authenticated user opens `/documents/{id}/office`
- **AND** their computed document access level is insufficient for the target document
- **THEN** the system SHALL reject the request with an appropriate error (e.g. 403 Forbidden)
- **AND** SHALL NOT expose an OnlyOffice configuration for that document.

#### Scenario: OnlyOffice config uses secure JWT

- **WHEN** the system generates an OnlyOffice configuration for `/documents/{id}/office`
- **THEN** the configuration payload and/or relevant sections SHALL be signed with a JWT using `ONLYOFFICE_JWT_SECRET`
- **AND** the generated token SHALL be included in the response according to OnlyOffice’s JWT requirements.

#### Scenario: OnlyOffice callback persists edits

- **WHEN** OnlyOffice sends a save-complete callback for a document edited via `/documents/{id}/office`
- **AND** the callback payload’s JWT is valid and matches the configured `ONLYOFFICE_JWT_SECRET`
- **THEN** the system SHALL persist the updated Office file content back to the existing storage path for that document
- **AND** update document metadata (e.g. modified user and timestamp) accordingly.

#### Scenario: Use existing Office file and URL

- **WHEN** the system builds the OnlyOffice configuration for a document with an `officeFilePath`
- **THEN** it SHALL use the existing stored Office file as the source
- **AND** it SHALL expose a document URL that allows OnlyOffice to fetch the file content (e.g. via `/documents/{id}/download?type=office`).

#### Scenario: Frontend opens embedded OnlyOffice editor

- **WHEN** a user navigates to the frontend route `/documents/{id}/office`
- **AND** the backend successfully returns a valid OnlyOffice configuration
- **THEN** the frontend SHALL render an embedded OnlyOffice editor/viewer using the official React component (`@onlyoffice/document-editor-react`)
- **AND** SHALL reflect the user’s permissions (edit vs view-only) as provided by the backend configuration.
