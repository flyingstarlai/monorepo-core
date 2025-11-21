## 1. Architecture

- [x] 1.1 Create CoreModule with shared entity registration
- [x] 1.2 Move LoginHistory entity to users domain
- [x] 1.3 Update all module imports to use CoreModule

## 2. Service Layer

- [x] 2.1 Implement IUsersService interface for dependency inversion
- [x] 2.2 Update MobileAppsService to use interface instead of direct entity access
- [x] 2.3 Resolve circular dependencies with forwardRef pattern

## 3. Testing

- [x] 3.1 Update unit tests for new import paths
- [x] 3.2 Verify all existing functionality works
- [x] 3.3 Update integration tests for module dependencies
- [x] 3.4 Update test imports for architectural changes
- [x] 3.2 Verify all existing functionality works
- [x] 3.3 Update integration tests for module dependencies

## 4. Validation

- [x] 4.1 Build and type-check all modules
- [x] 4.2 Run lint and fix any issues
- [x] 4.3 Verify E2E functionality unchanged
