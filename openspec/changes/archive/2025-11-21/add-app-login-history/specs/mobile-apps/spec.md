## ADDED Requirements

### Requirement: App Login History Tracking

The system SHALL provide login history data for specific mobile apps to enable security monitoring and user activity analysis.

#### Scenario: Admin views app login history

- **WHEN** an admin user navigates to `/mobile-apps/:id/login-history`
- **THEN** the system SHALL display a paginated list of login attempts for that specific app_id
- **AND** include columns for username, success status, failure reason, login timestamp, account ID, app version, and app module

#### Scenario: Manager filters login history by date range

- **WHEN** a manager user provides start_date and end_date query parameters
- **THEN** the system SHALL filter login records to only include attempts within the specified date range
- **AND** validate that start_date is before end_date
- **AND** return an empty array if no records exist in the range

#### Scenario: System handles pagination for large datasets

- **WHEN** the login history contains more than 50 records
- **THEN** the system SHALL support pagination via page and limit query parameters
- **AND** return pagination metadata including total count, current page, and total pages
- **AND** default to page 1 with limit 50 if not specified

#### Scenario: Access control enforcement

- **WHEN** a user without admin or manager role attempts to access login history
- **THEN** the system SHALL return a 403 Forbidden error
- **AND** when an unauthenticated user attempts access, return 401 Unauthorized

#### Scenario: Login history data aggregation

- **WHEN** querying TC_ACCOUNT_LOGIN table
- **THEN** the system SHALL filter records by app_id matching the requested mobile app ID
- **AND** order results by login_at descending (most recent first)
- **AND** include both successful and failed login attempts

#### Scenario: UI integration with mobile apps overview

- **WHEN** viewing the mobile apps overview table
- **THEN** each app row SHALL include a "View Login History" action button
- **AND** clicking the button SHALL navigate to the login history page for that specific app
