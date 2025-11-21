## ADDED Requirements

### Requirement: Mobile Apps Overview API

The system SHALL expose a read-only endpoint that lists connected mobile apps aggregated from the MSSQL table `TC_APP_USER`.

- Endpoint: `GET /mobile-apps`
- Auth: JWT required; roles allowed: `admin`, `manager`
- Data source: `TC_APP_USER` (columns used: `app_id`, `app_name`, `app_version`, `is_active`, `userid`, `username`, `useremail`, `company`)
- Aggregation keys: group by `app_id`, `app_name`
- Response items SHALL include:
  - `appId` (string) — from `app_id`
  - `appName` (string) — from `app_name`
  - `latestVersion` (string|null) — most recent version across the group determined by semantic version comparison when possible; fallback to lexicographic comparison
  - `versions` (string[]) — distinct versions observed across the group, unsorted or sorted ascending
  - `activeDevices` (number) — count of rows with `is_active = 1`
  - `totalDevices` (number) — total rows in the group
  - `uniqueUsers` (number) — count of distinct users by the first non-empty of (`useremail`, `username`, `userid`)
  - `companies` (number) — count of distinct non-empty `company`

#### Scenario: Success (authorized)

- **WHEN** a request with a valid JWT from a user with role `admin` or `manager` calls `GET /mobile-apps`
- **THEN** the API responds `200 OK` with a JSON array of items each containing `appId`, `appName`, `latestVersion`, `versions`, `activeDevices`, `totalDevices`, `uniqueUsers`, and `companies`

#### Scenario: Unauthorized (no token)

- **WHEN** a request without a JWT calls `GET /mobile-apps`
- **THEN** the API responds `401 Unauthorized`

#### Scenario: Forbidden (insufficient role)

- **WHEN** a request with a valid JWT from a user with role `user` calls `GET /mobile-apps`
- **THEN** the API responds `403 Forbidden`

### Requirement: Mobile Apps Overview Page (Web)

The system SHALL provide a protected page to display the aggregated mobile apps list.

- Route: `/_authenticated/apps` (file-based route maps to URL `/apps`)
- Access control: beforeLoad MUST restrict access to roles `admin` and `manager`; others redirected to `/unauthorized`
- Data: fetched from API `GET /mobile-apps` using existing axios client
- UI: table view with columns: `App Name`, `App ID`, `Latest Version`, `Active Devices`, `Total Devices`, `Unique Users`

#### Scenario: Page render (authorized)

- **WHEN** an `admin` or `manager` navigates to `/apps`
- **THEN** the page loads and displays the table populated with API data

#### Scenario: Redirect (insufficient role)

- **WHEN** a `user` navigates to `/apps`
- **THEN** the router redirects to `/unauthorized` with the attempted location in querystring

### Requirement: Sidebar Navigation

The application SHALL include a sidebar menu item linking to the Apps Overview page.

- Label: `Apps` (final copy subject to localization later)
- Icon: smartphone/phone icon from `lucide-react`
- Visibility: ONLY for `admin` and `manager`
- Link target: `/apps`

#### Scenario: Visible for admin and manager

- **WHEN** an authenticated user with role `admin` or `manager` views the sidebar
- **THEN** an `Apps` item links to `/apps` and highlights when active

#### Scenario: Hidden for user

- **WHEN** an authenticated user with role `user` views the sidebar
- **THEN** the `Apps` item is not displayed
