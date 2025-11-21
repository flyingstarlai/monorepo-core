## MODIFIED Requirements

### Requirement: Mobile Apps Overview API

The system SHALL expose a read-only endpoint that lists connected mobile apps aggregated from MSSQL table `TC_APP_USER`.

#### Scenario: Service layer dependency inversion

- **WHEN** MobileAppsService needs login history data
- **THEN** it SHALL access it through to `IUsersService` interface rather than direct entity repository access
- **AND** the interface SHALL define contracts for cross-module communication without tight coupling

#### Scenario: Module dependency resolution

- **WHEN** the application initializes MobileApps module
- **THEN** the module SHALL import CoreModule for entity access and use `forwardRef` for any Users module dependencies to resolve circular references
- **AND** the module SHALL maintain existing API contracts and behavior

## ADDED Requirements

### Requirement: Shared Entity Core Module

The application SHALL provide a centralized module for shared entity registration and access across domains.

#### Scenario: Core entity registration

- **WHEN** application initializes modules
- **THEN** the CoreModule SHALL register all entities (User, MobileApp, LoginHistory) in `TypeOrmModule.forFeature` and export the repository module for shared access
- **AND** other modules SHALL import CoreModule to access entities without cross-domain dependencies

#### Scenario: Domain boundary enforcement

- **WHEN** modules are structured by business domain
- **THEN** each entity SHALL reside in its primary domain module (LoginHistory in users, MobileApp in mobile-apps)
- **AND** shared access SHALL be provided through CoreModule rather than direct cross-module imports
