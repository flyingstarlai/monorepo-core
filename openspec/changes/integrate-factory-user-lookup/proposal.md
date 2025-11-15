# Integrate Factory User Lookup

## Summary

Add factory user lookup functionality that allows users to search and select factory users via F2 key in username field, populating form fields with selected user data from LS_FACTORY_USER_ACCOUNT stored procedure.

## Status

🟡 In Progress

## Date

2025-11-15

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
