## Why

The Account Manager web application currently supports only English interface, limiting accessibility for Traditional Chinese users in Taiwan, Hong Kong, and other Chinese-speaking regions. Adding Traditional Chinese localization will expand user base, improve user experience for Chinese-speaking users, and demonstrate cultural inclusivity.

## What Changes

- Add Traditional Chinese translations for all UI components and user-facing text
- Update authentication interface (login, password change, profile) with Traditional Chinese
- Translate navigation elements and dashboard components
- Convert user management interface including forms, tables, and dialogs
- Localize error messages, validation text, and loading states
- Update search drawer components and factory lookup interfaces
- Translate dashboard statistics and activity feed content

## Impact

- **Affected specs**: web-ui, auth
- **Affected code**: All frontend React components in apps/web/src/
- **Breaking changes**: None - additive localization only
- **User experience**: Complete Traditional Chinese interface while maintaining English functionality
- **Testing**: Required to verify text display and functionality in Traditional Chinese
