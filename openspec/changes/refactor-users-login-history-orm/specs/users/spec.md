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

## ADDED Requirements

### Requirement: Shared Entity Core Module

The application SHALL provide a centralized module for shared entity registration and access across domains.

### Requirement: ORM-Based User Login History Access

The Users service SHALL use ORM entities for all SELECT-based reads of user login history from `TC_ACCOUNT_LOGIN`, preserving existing behavior.

#### Scenario: Latest mobile login meta retrieved via ORM

- **WHEN** the system retrieves the latest mobile login info for a user
- **THEN** it SHALL query the `LoginHistory` entity by `accountId` ordered by `loginAt` descending and take the first record
- **AND** it SHALL return `lastMobileLoginAt`, `lastMobileDeviceId`, `lastMobileAppName`, `lastMobileAppVersion`, and `lastMobileAppModule` mapped from the entity fields (`loginAt`, `appId`, `appName`, `appVersion`, `appModule`)
- **AND** no raw SQL `SELECT` statements SHALL be used in application code for this retrieval

#### Scenario: User login history list retrieved via ORM with limit

- **WHEN** the system retrieves a user's login history with a limit `N`
- **THEN** it SHALL query the `LoginHistory` entity by `accountId` ordered by `loginAt` descending with an ORM-applied limit (`take(N)` or equivalent)
- **AND** it SHALL return items mapped to the existing DTO shape with the same ordering semantics as before
- **AND** no raw SQL `SELECT` statements SHALL be used in application code for this retrieval

#### Scenario: Module wiring for repository

- **WHEN** the application initializes the Users module
- **THEN** the module SHALL register `LoginHistory` in `TypeOrmModule.forFeature` and the service SHALL inject its repository for data access

#### Scenario: Stored procedure scope unaffected

- **WHEN** the system executes existing stored procedures (e.g., `ACM_FACTORY_*`)
- **THEN** this change SHALL NOT mandate ORM replacements for those calls; they MAY continue as-is
