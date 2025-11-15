# Frontend Integration - Factory User Lookup

## ADDED Requirements

### Requirement: Factory User Types Interface

The system SHALL provide a FactoryUser interface for frontend components to work with factory user data.

#### Scenario: Interface Definition

- **WHEN** frontend components work with factory user data
- **THEN** the FactoryUser interface SHALL define fields: username, fullName, deptNo, deptName
- **AND** the interface SHALL be exported for use across components
- **AND** type definitions SHALL match backend FactoryUserDto exactly
- **AND** the interface SHALL support optional fields for future extensibility

### Requirement: Factory Users Data Hook

The system SHALL provide a TanStack Query hook for fetching factory user data with caching and error handling.

#### Scenario: Data Fetching

- **WHEN** components need factory user data
- **THEN** the useFactoryUsers hook SHALL fetch from /users/factory endpoint
- **AND** the hook SHALL include 5-minute stale time for caching
- **AND** the hook SHALL handle loading and error states
- **AND** the hook SHALL be properly typed with FactoryUser interface

#### Scenario: Manual Refresh

- **WHEN** users need to refresh factory user data
- **THEN** the hook SHALL support manual refetch functionality
- **AND** the refresh SHALL maintain existing cache state

### Requirement: User Search Drawer Component

The system SHALL provide a slide-out drawer component for searching and selecting factory users.

#### Scenario: Drawer Opening

- **WHEN** a user presses F2 in the username field
- **THEN** a drawer SHALL slide in from the right side of the screen
- **AND** the drawer SHALL contain a search input for filtering users
- **AND** the drawer SHALL display factory users in TanStack Table format

#### Scenario: Table Display

- **WHEN** factory users are displayed in the drawer
- **THEN** the table SHALL show columns: Username, Full Name, Department Code, Department Name
- **AND** the drawer SHALL close when user selects a row or presses Escape
- **AND** the drawer SHALL have proper loading and error states
- **AND** the drawer SHALL be fully accessible via keyboard navigation

### Requirement: Table Component for Factory Users

The system SHALL provide a table component with sorting, filtering, and selection capabilities for factory users.

#### Scenario: Table Interaction

- **WHEN** displaying factory users in the drawer
- **THEN** the table SHALL support sorting by all columns
- **AND** the table SHALL support text-based filtering across all fields
- **AND** the table SHALL highlight row on hover
- **AND** the table SHALL select user on row click or Enter key

#### Scenario: Table States

- **WHEN** the table has no data or encounters errors
- **THEN** the table SHALL handle empty state with appropriate message
- **AND** the table SHALL be responsive and scrollable for large datasets

### Requirement: F2 Keyboard Integration

The system SHALL provide F2 keyboard shortcut integration for opening factory user lookup.

#### Scenario: Keyboard Shortcut

- **WHEN** a user is in the username field of the user form
- **THEN** pressing F2 SHALL open the factory user lookup drawer
- **AND** F2 key SHALL be captured specifically in username input field
- **AND** F2 SHALL prevent default browser behavior
- **AND** F2 SHALL work in both create and edit user forms

#### Scenario: Visual Feedback

- **WHEN** the username field is focused
- **THEN** a visual indicator SHALL hint at F2 functionality
- **AND** the indicator SHALL be accessible to screen readers

### Requirement: Form Auto-Population

The system SHALL automatically populate user form fields when a factory user is selected.

#### Scenario: Field Population

- **WHEN** a user selects a factory user from the drawer
- **THEN** the Username field SHALL be populated and set to readonly
- **AND** the Full Name field SHALL be populated with selected user's full_name
- **AND** the Department Code field SHALL be populated with selected user's dept_no
- **AND** the Department Name field SHALL be populated with selected user's dept_name

#### Scenario: Form State Management

- **WHEN** form fields are auto-populated
- **THEN** form validation SHALL recognize auto-populated data as valid
- **AND** the form SHALL maintain dirty state tracking after population
- **AND** the drawer SHALL close after successful selection

## MODIFIED Requirements

### Requirement: User Form Enhancement

The existing UserForm component SHALL be enhanced to support factory user lookup while maintaining all current functionality.

#### Scenario: Form Integration

- **WHEN** integrating factory user lookup
- **THEN** all existing form fields and validation SHALL remain unchanged
- **AND** the Username field SHALL gain F2 keyboard event listener
- **AND** the Username field SHALL show visual hint for F2 functionality
- **AND** the form SHALL handle drawer state without breaking existing workflows

#### Scenario: Accessibility Compliance

- **WHEN** adding new features to the form
- **THEN** the form SHALL maintain accessibility standards
- **AND** all new interactive elements SHALL be keyboard navigable
- **AND** screen reader announcements SHALL be provided for drawer actions

### Requirement: User Types Extension

The existing user types SHALL be extended to include factory user interfaces while preserving all current type definitions.

#### Scenario: Type Extension

- **WHEN** adding factory user functionality
- **THEN** all existing User, CreateUserData, UpdateUserData interfaces SHALL remain unchanged
- **AND** the FactoryUser interface SHALL be added to the same types file
- **AND** type exports SHALL include new interface for component imports
- **AND** type consistency SHALL be maintained between frontend and backend

### Requirement: User Hooks Extension

The existing use-users hook file SHALL be extended with factory user functionality while maintaining current data fetching patterns.

#### Scenario: Hook Extension

- **WHEN** adding factory user data fetching
- **THEN** all existing hooks (useUsers, useUser, useCreateUser, etc.) SHALL remain unchanged
- **AND** the new useFactoryUsers hook SHALL follow existing patterns
- **AND** error handling SHALL be consistent with existing hooks
- **AND** query client configuration SHALL be reused appropriately
