## ADDED Requirements

### Requirement: User entity has minimal fields
The system SHALL store users with only essential fields: id, username, password, fullName, role, createdAt, updatedAt.

#### Scenario: User entity structure
- **WHEN** user is retrieved from database
- **THEN** entity contains only: id, username, password (hashed), fullName, role, createdAt, updatedAt

### Requirement: User roles are limited to admin and user
The system SHALL support only two roles: `admin` and `user`.

#### Scenario: Valid roles
- **WHEN** user is created or updated
- **THEN** role must be either `admin` or `user`

#### Scenario: Invalid role rejected
- **WHEN** user is created with role other than admin or user
- **THEN** system returns validation error

### Requirement: Admin can create users
The system SHALL allow admin users to create new user accounts.

#### Scenario: Admin creates user with valid data
- **WHEN** admin submits username, password, fullName, and role
- **THEN** system creates new user with hashed password

#### Scenario: Duplicate username rejected
- **WHEN** admin creates user with existing username
- **THEN** system returns 409 Conflict error

### Requirement: Admin can list all users
The system SHALL allow admin users to retrieve a list of all users.

#### Scenario: Admin retrieves user list
- **WHEN** admin requests user list
- **THEN** system returns array of users (without passwords)

### Requirement: Admin can view any user
The system SHALL allow admin users to view details of any user.

#### Scenario: Admin views user by ID
- **WHEN** admin requests user by valid ID
- **THEN** system returns user details (without password)

#### Scenario: User not found
- **WHEN** admin requests user by non-existent ID
- **THEN** system returns 404 Not Found

### Requirement: Admin can update any user
The system SHALL allow admin users to update any user's details.

#### Scenario: Admin updates user
- **WHEN** admin updates user's fullName or role
- **THEN** system saves changes and returns updated user

#### Scenario: Admin updates password
- **WHEN** admin updates user's password
- **THEN** system hashes new password before saving

### Requirement: Admin can delete users
The system SHALL allow admin users to delete user accounts.

#### Scenario: Admin deletes user
- **WHEN** admin deletes user by ID
- **THEN** system removes user from database

#### Scenario: Cannot delete self
- **WHEN** admin attempts to delete their own account
- **THEN** system returns 400 Bad Request

### Requirement: Users can view their own profile
The system SHALL allow users to view their own profile information.

#### Scenario: User views own profile
- **WHEN** authenticated user requests their profile
- **THEN** system returns user details (without password)

### Requirement: Users can update their own profile
The system SHALL allow users to update their own fullName and password.

#### Scenario: User updates own fullName
- **WHEN** user updates their fullName
- **THEN** system saves changes

#### Scenario: User updates own password
- **WHEN** user updates their password
- **THEN** system hashes new password before saving

#### Scenario: User cannot change own role
- **WHEN** user attempts to update their role
- **THEN** system ignores role field or returns error

### Requirement: Username must be unique
The system SHALL enforce unique usernames across all users.

#### Scenario: Duplicate username on create
- **WHEN** creating user with existing username
- **THEN** system returns validation error

#### Scenario: Duplicate username on update
- **WHEN** updating user's username to an existing value
- **THEN** system returns validation error
