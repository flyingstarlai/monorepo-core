# Integrate Factory User Lookup

## Summary

Add factory user lookup functionality that allows users to search and select factory users via F2 key in username field, populating form fields with selected user data from LS_FACTORY_USER_ACCOUNT stored procedure.

## Status

🟢 Complete

## Date

2025-11-15

## Why

The current user creation workflow requires manual data entry for all user fields, leading to potential data entry errors and inconsistent information. Factory users already exist in the SQL Server database with standardized data, but there's no efficient way to access this information during user creation. This creates unnecessary work for administrators and increases the risk of data inconsistencies between the factory system and the user management system.

## What Changes

### Backend Changes

- **New DTO**: `FactoryUserDto` for type-safe data transfer with validation decorators
- **Service Method**: `getFactoryUsers()` in `UsersService` to execute `LS_FACTORY_USER_ACCOUNT` stored procedure
- **API Endpoint**: `GET /users/factory` with JWT authentication for secure data access
- **Error Handling**: Comprehensive error handling for database and procedure execution failures

### Frontend Changes

- **Type Definitions**: `FactoryUser` interface matching backend DTO structure
- **Data Hook**: `useFactoryUsers()` TanStack Query hook with caching and error handling
- **UI Components**:
  - `UserSearchDrawer` slide-out component with search functionality
  - TanStack Table integration with sorting, filtering, and row selection
- **Form Integration**: F2 keyboard shortcut in username fields to open lookup drawer
- **Auto-Population**: Automatic form field population when factory user is selected

### Integration Features

- **Keyboard Navigation**: F2 key support, Escape to close drawer, Enter to select user
- **Visual Feedback**: Loading states, error states, and hover effects
- **Accessibility**: ARIA labels, focus management, and screen reader support

## Scope

- Backend: New API endpoint to call LS_FACTORY_USER_ACCOUNT procedure
- Frontend: User search drawer with TanStack Table and F2 keyboard integration
- Integration: Auto-population of user form fields from selected factory user

## Impact

Enhances user creation/editing workflow by providing quick access to factory user data, reducing manual data entry and improving data consistency.

## Related Changes

None

## Dependencies

- SQL Server stored procedure `LS_FACTORY_USER_ACCOUNT` must exist and return expected fields
- Existing user management system must be functional
