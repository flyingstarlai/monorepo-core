## MODIFIED Requirements

### Requirement: ORM-Based User Login History Access

The Users service SHALL use ORM entities for all SELECT-based reads of user login history from `TC_ACCOUNT_LOGIN`, preserving existing behavior.

#### Scenario: Latest mobile login meta retrieved via ORM

- **WHEN** system retrieves the latest mobile login info for a user
- **THEN** it SHALL query the `LoginHistory` entity by `accountId` ordered by `loginAt` descending and take the first record
- **AND** it SHALL return `lastMobileLoginAt`, `lastMobileDeviceId`, `lastMobileAppName`, `lastMobileAppVersion`, and `lastMobileAppModule` mapped from the entity fields (`loginAt`, `appId`, `appName`, `appVersion`, `appModule`)
- **AND** no raw SQL `SELECT` statements SHALL be used in application code for this retrieval

#### Scenario: User login history list retrieved via ORM with limit

- **WHEN** system retrieves a user's login history with a limit `N`
- **THEN** it SHALL query the `LoginHistory` entity by `accountId` ordered by `loginAt` descending with an ORM-applied limit (`take(N)` or equivalent)
- **AND** it SHALL return items mapped to the existing DTO shape with the same ordering semantics as before
- **AND** no raw SQL `SELECT` statements SHALL be used in application code for this retrieval

#### Scenario: Module wiring for repository

- **WHEN** application initializes the Users module
- **THEN** the module SHALL register `LoginHistory` in `TypeOrmModule.forFeature` and the service SHALL inject its repository for data access

#### Scenario: Stored procedure scope unaffected

- **WHEN** system executes existing stored procedures (e.g., `ACM_FACTORY_*`)
- **THEN** this change SHALL NOT mandate ORM replacements for those calls; they MAY continue as-is

## ADDED Requirements

### Requirement: Shared Entity Core Module

The application SHALL provide a centralized module for shared entity registration and access across domains.

#### Scenario: Core entity registration

- **WHEN** application initializes modules
- **THEN** CoreModule SHALL register all entities (User, MobileApp, LoginHistory) in `TypeOrmModule.forFeature` and export the repository module for shared access
- **AND** other modules SHALL import CoreModule to access entities without cross-domain dependencies

#### Scenario: Domain boundary enforcement

- **WHEN** modules are structured by business domain
- **THEN** each entity SHALL reside in its primary domain module (LoginHistory in users, MobileApp in mobile-apps)
- **AND** shared access SHALL be provided through CoreModule rather than direct cross-module imports

#### Scenario: Shared entity access

- **WHEN** a service needs entities from another domain
- **THEN** it SHALL access them through CoreModule imports rather than direct cross-domain entity imports
- **AND** CoreModule SHALL provide TypeOrmModule exports for repository injection

#### Scenario: Module dependency resolution

- **WHEN** application bootstraps modules
- **THEN** modules with cross-dependencies SHALL use forwardRef pattern to resolve circular references
- **AND** each module SHALL maintain clean import boundaries without direct entity access from other domains

#### Scenario: Core entity registration

- **WHEN** application initializes modules
- **THEN** CoreModule SHALL register all entities (User, MobileApp, LoginHistory) in `TypeOrmModule.forFeature` and export the repository module for shared access
- **AND** other modules SHALL import CoreModule to access entities without cross-domain dependencies

#### Scenario: Domain boundary enforcement

- **WHEN** modules are structured by business domain
- **THEN** each entity SHALL reside in its primary domain module (LoginHistory in users, MobileApp in mobile-apps)
- **AND** shared access SHALL be provided through CoreModule rather than direct cross-module imports

#### Scenario: Shared entity access

- **WHEN** a service needs entities from another domain
- **THEN** it SHALL access them through CoreModule imports rather than direct cross-domain entity imports
- **AND** CoreModule SHALL provide TypeOrmModule exports for repository injection

#### Scenario: Module dependency resolution

- **WHEN** application bootstraps modules
- **THEN** modules with cross-dependencies SHALL use forwardRef pattern to resolve circular references
- **AND** each module SHALL maintain clean import boundaries without direct entity access from other domains

#### Scenario: Core entity registration

- **WHEN** the application initializes modules
- **THEN** the CoreModule SHALL register all entities (User, MobileApp, LoginHistory) in `TypeOrmModule.forFeature` and export the repository module for shared access
- **AND** other modules SHALL import CoreModule to access entities without cross-domain dependencies

#### Scenario: Domain boundary enforcement

- **WHEN** modules are structured by business domain
- **THEN** each entity SHALL reside in its primary domain module (LoginHistory in users, MobileApp in mobile-apps)
- **AND** shared access SHALL be provided through CoreModule rather than direct cross-module imports

## MODIFIED Requirements

### Requirement: Mobile Apps Overview API

The system SHALL expose a read-only endpoint that lists connected mobile apps aggregated from MSSQL table `TC_APP_USER`.

#### Scenario: Service layer dependency inversion

- **WHEN** the MobileAppsService needs login history data
- **THEN** it SHALL access it through the `IUsersService` interface rather than direct entity repository access
- **AND** the interface SHALL define contracts for cross-module communication without tight coupling

#### Scenario: Module dependency resolution

- **WHEN** the application initializes the MobileApps module
- **THEN** the module SHALL import CoreModule for entity access and use `forwardRef` for any Users module dependencies to resolve circular references

#### Scenario: Shared entity access

- **WHEN** a service needs entities from another domain
- **THEN** it SHALL access them through CoreModule imports rather than direct cross-domain entity imports
- **AND** CoreModule SHALL provide TypeOrmModule exports for repository injection

#### Scenario: Interface-based communication

- **WHEN** modules communicate across domain boundaries
- **THEN** they SHALL use well-defined interfaces rather than direct service dependencies
- **AND** interfaces SHALL specify clear contracts with proper TypeScript typing

#### Scenario: ForwardRef for circular dependencies

- **WHEN** two modules have circular dependencies
- **THEN** they SHALL use forwardRef pattern to resolve the circular reference
- **AND** the injection SHALL be properly typed and configured
