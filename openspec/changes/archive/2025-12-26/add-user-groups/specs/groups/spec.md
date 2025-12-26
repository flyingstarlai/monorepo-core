## ADDED Requirements

### Requirement: Group Management API

Administrators SHALL manage logical user groups through the API app without affecting existing permission rules.

#### Scenario: Admin creates or updates a group

- **GIVEN** an authenticated `admin`
- **WHEN** they call `POST /groups` or `PUT /groups/:id` with a unique name plus optional description/active flag
- **THEN** the API SHALL persist the group record with timestamps and return the saved data

#### Scenario: Admin lists or fetches groups

- **GIVEN** an authenticated `admin`
- **WHEN** they call `GET /groups` or `GET /groups/:id`
- **THEN** the API SHALL return group data (name, description, active flag, timestamps) without exposing membership changes to non-admin roles

#### Scenario: Admin deletes a group

- **GIVEN** an authenticated `admin`
- **WHEN** they call `DELETE /groups/:id`
- **THEN** the API SHALL remove the group and its memberships, leaving users themselves unchanged

### Requirement: Group Membership Management

The system SHALL maintain many-to-many relationships between users and groups with admin-controlled membership operations.

#### Scenario: Admin adds users to a group

- **GIVEN** an authenticated `admin` and an existing group
- **WHEN** they call `POST /groups/:id/users` with a list of user IDs
- **THEN** the API SHALL associate each specified user with the group (ignoring duplicates) and store membership timestamps

#### Scenario: Admin removes a user from a group

- **GIVEN** an authenticated `admin`, an existing group, and a member user
- **WHEN** they call `DELETE /groups/:id/users/:userId`
- **THEN** the API SHALL remove that membership without altering the user record

#### Scenario: Admin lists members of a group

- **GIVEN** an authenticated `admin`
- **WHEN** they call `GET /groups/:id/users`
- **THEN** the API SHALL return the list of users in that group (username, full name, role, membership timestamps)

### Requirement: Admin Group Management UI

The web application SHALL provide admin-only interfaces to manage groups and memberships.

#### Scenario: Admin views and edits groups

- **GIVEN** an authenticated `admin` in the web UI
- **WHEN** they open the Groups section
- **THEN** they SHALL see a list of groups with actions to create, edit (name/description/active), and delete groups, with errors surfaced from the API

#### Scenario: Admin manages group membership in UI

- **GIVEN** an authenticated `admin` viewing a group detail page
- **WHEN** they add or remove members through the UI
- **THEN** the UI SHALL call the membership APIs, show loading/error states, and refresh the membership list upon success
