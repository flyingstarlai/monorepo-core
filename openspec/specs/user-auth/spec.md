## ADDED Requirements

### Requirement: User can login with username and password
The system SHALL authenticate users via username and password credentials.

#### Scenario: Successful login with valid credentials
- **WHEN** user submits valid username and password
- **THEN** system returns JWT token and user info

#### Scenario: Failed login with invalid credentials
- **WHEN** user submits invalid username or password
- **THEN** system returns 401 Unauthorized error

### Requirement: System issues JWT tokens on authentication
The system SHALL issue JWT tokens for authenticated sessions.

#### Scenario: JWT token issued on login
- **WHEN** user successfully authenticates
- **THEN** system returns a valid JWT token with user id, username, and role

#### Scenario: JWT token contains role information
- **WHEN** JWT token is decoded
- **THEN** payload includes `role` field with value `admin` or `user`

### Requirement: Protected routes require valid JWT
The system SHALL validate JWT tokens for protected API routes.

#### Scenario: Access protected route with valid token
- **WHEN** request includes valid Authorization header with Bearer token
- **THEN** system allows access to protected route

#### Scenario: Access protected route without token
- **WHEN** request lacks Authorization header
- **THEN** system returns 401 Unauthorized

#### Scenario: Access protected route with expired token
- **WHEN** request includes expired JWT token
- **THEN** system returns 401 Unauthorized

### Requirement: Admin routes require admin role
The system SHALL restrict certain routes to users with admin role.

#### Scenario: Admin accesses admin-only route
- **WHEN** admin user requests admin-only endpoint
- **THEN** system allows access

#### Scenario: Regular user accesses admin-only route
- **WHEN** regular user (role: user) requests admin-only endpoint
- **THEN** system returns 403 Forbidden

### Requirement: User can logout
The system SHALL allow users to logout and invalidate their session.

#### Scenario: Successful logout
- **WHEN** authenticated user requests logout endpoint
- **THEN** system returns success response

### Requirement: Passwords are hashed
The system SHALL store passwords as bcrypt hashes, never in plain text.

#### Scenario: Password stored as hash
- **WHEN** user is created or password is updated
- **THEN** password is stored as bcrypt hash in database

#### Scenario: Password verification uses hash comparison
- **WHEN** user logs in
- **THEN** system compares submitted password against stored hash
