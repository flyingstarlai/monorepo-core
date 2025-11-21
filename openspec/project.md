# Project Context

## Purpose

ACM (Account Manager) is a comprehensive account management system designed to efficiently manage user accounts across departments. It provides secure authentication, comprehensive user management capabilities, and insightful analytics through an intuitive dashboard interface. The system is built for enterprise environments requiring role-based access control, department-based organization, and real-time user analytics.

## Tech Stack

### Monorepo & Build System

- **Turborepo** - High-performance build system for monorepos
- **pnpm** - Fast, disk space efficient package manager
- **TypeScript** - Type-safe JavaScript across all packages

### Backend (NestJS API)

- **NestJS** - Progressive Node.js framework for building efficient APIs
- **TypeORM** - Modern ORM for TypeScript and JavaScript
- **SQL Server** - Enterprise-grade database (mssql driver)
- **JWT Authentication** - Secure token-based authentication
- **Passport** - Authentication middleware for Node.js
- **bcrypt/bcryptjs** - Password hashing
- **class-validator & class-transformer** - DTO validation and transformation

### Frontend (React Web)

- **React 19** - Modern React with latest features
- **TanStack Router** - Type-safe routing with data loading
- **TanStack Query** - Powerful data synchronization and server state management
- **TanStack Table** - Headless table for building complex data grids
- **Tailwind CSS** - Utility-first CSS framework (v4)
- **Radix UI** - Unstyled, accessible UI components
- **Zod** - TypeScript-first schema validation
- **React Hook Form** - Form validation with Zod resolvers
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Zustand** - Lightweight state management
- **next-themes** - Dark/light theme support

### Development Tools

- **ESLint** - Code linting with custom configurations (@repo/eslint-config)
- **Prettier** - Code formatting with shared configuration
- **Jest** - Backend testing framework
- **Vitest** - Frontend testing framework
- **Vite** - Frontend build tool and dev server
- **Docker** - Containerization for development and production

## Project Conventions

### Code Style

- **ESLint Configurations**: Shared configs for base, library, Next.js, NestJS, and React projects
- **Prettier Configuration**: Shared prettier-base configuration across all packages
- **TypeScript**: Strict mode enabled, shared tsconfig files for different project types
- **Naming Conventions**:
  - Files: kebab-case for most files, PascalCase for components
  - Variables: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Classes/Interfaces: PascalCase
- **Import Organization**: External imports first, then internal imports, sorted alphabetically
- **Date Formatting**: All dates must use UTC+8 timezone via `formatDateUTC8()` utility function

### Architecture Patterns

- **Monorepo Structure**: Feature-based organization with shared packages
- **Modular Architecture**: Separate modules for auth, users, dashboard, etc.
- **Shared Core Module**: Centralized entity registration and access
- **Domain Boundaries**: Each entity resides in its primary business domain
- **Dependency Injection**: NestJS DI pattern throughout backend
- **Interface-Based Communication**: Cross-module services use dependency inversion
- **Feature-Based Frontend**: Components organized by feature domain
- **API-First Design**: Backend API drives frontend data flow
- **Entity-Driven Backend**: TypeORM entities define data structure

### Testing Strategy

- **Backend Testing**: Jest for unit tests and e2e tests
- **Test Organization**: Tests co-located with source files (\*.spec.ts)
- **Coverage**: Comprehensive test coverage required for critical paths
- **Test Data**: Seed files for consistent test database state
- **Mock Strategy**: Mock external dependencies and database connections in tests

### Architecture Implementation Status ✅

- **Core Module**: Centralized entity registration with shared access across all domains
- **Domain Boundaries**: Clean entity ownership by business domain (Users, Mobile Apps, Dashboard)
- **Dependency Inversion**: Interface-based cross-module communication with proper contracts
- **Circular Dependencies**: Resolved using forwardRef pattern for module initialization
- **Shared Entity Access**: CoreModule provides TypeORM exports for repository injection
- **Module Communication**: Services use well-defined interfaces rather than direct dependencies

### Git Workflow

- **Branching Strategy**: Feature branches from main (git checkout -b feature/feature-name)
- **Commit Convention**: Conventional commits (feat:, fix:, docs:, style:, refactor:, test:, chore:)
- **Pull Request**: Required for all changes with code review
- **Merge Strategy**: Squash merge to main branch
- **Release**: Tagged releases from main branch

## Domain Context

### User Management Domain (IMPLEMENTED)

- **Users**: Core entity with ID, username, password, role, full name, department info, and status
- **LoginHistory**: User login attempt tracking entity (moved from mobile-apps domain)
- **Departments**: Organizational units with dept_no and dept_name fields
- **Roles**: Three-tier permission system (admin, manager, user) with hierarchical access control
- **Authentication**: JWT-based with access tokens and refresh token support
- **User Status**: Active/Inactive toggle functionality with role-based permissions
- **User Management Features**: CRUD operations, search, filtering, factory integration
- **Profile Management**: Users can update their own profile information
- **Password Management**: Change password with current password verification
- **Architecture**: Clean domain boundaries with shared CoreModule for entity access

### Mobile Apps Management Domain (IMPLEMENTED)

- **Mobile Apps Overview**: Aggregated view of all connected mobile apps with device counts and user metrics
- **App Login History**: Detailed login tracking for specific mobile apps with date filtering and pagination
- **Device Management**: Track active vs total devices per app with version information
- **User Analytics**: Count unique users and companies per mobile application
- **Security Monitoring**: Login attempt tracking with success/failure status and failure reasons

#### Mobile Apps Features (IMPLEMENTED)

- **Overview Endpoint**: `/mobile-apps` provides aggregated app statistics
- **Login History Endpoint**: `/mobile-apps/:id/login-history` provides detailed login tracking
- **Role-Based Access**: Admin and manager access to mobile app data
- **Date Filtering**: Filter login history by date range with validation
- **Pagination**: Support for large datasets with configurable page sizes
- **Traditional Chinese Localization**: Full UI support for Traditional Chinese language

#### Frontend Routes (IMPLEMENTED)

- **Mobile Apps Overview**: `/apps` - Complete mobile apps management interface
- **App Login History**: `/apps/$id/login-history` - Detailed login history view
- **Sidebar Navigation**: Apps menu item for admin and manager users

### Dashboard Analytics Domain (PARTIALLY IMPLEMENTED)

- **User Statistics**: Dashboard stats endpoint with user counts and metrics
- **Activity Tracking**: Recent activity endpoint for user actions
- **Department Analytics**: User distribution by department (data available via user service)

#### Dashboard Features (IMPLEMENTED)

- **Stats Endpoint**: `/dashboard/stats` provides user statistics
- **Activity Endpoint**: `/dashboard/activity` provides recent user activities
- **Frontend Dashboard**: React dashboard component with overview display

### Authentication & Security Domain (IMPLEMENTED)

- **Password Security**: bcrypt hashing for secure password storage
- **JWT Authentication**: Access tokens with configurable expiration (default 24h)
- **Refresh Tokens**: Token refresh mechanism for extended sessions
- **Input Validation**: Comprehensive DTO validation using class-validator
- **CORS Configuration**: Environment-based CORS with configurable origins
- **SQL Injection Prevention**: TypeORM parameterized queries
- **Role-Based Guards**: JWT authentication guards with role verification

#### Authentication Endpoints (IMPLEMENTED)

- **POST /auth/login**: User login with username/password
- **POST /auth/create-user**: User registration (creates new users)
- **POST /auth/refresh**: Refresh access token using refresh token
- **GET /auth/profile**: Get current user profile
- **POST /auth/change-password**: Change password with current password verification

### Settings & Profile Domain (IMPLEMENTED)

- **Account Settings**: User profile management interface
- **Profile Updates**: Full name and basic information editing
- **Password Changes**: Secure password change functionality
- **Settings UI**: Dedicated settings pages in the frontend

#### Frontend Routes (IMPLEMENTED)

- **Dashboard**: `/dashboard` - Overview with user statistics
- **User Management**: `/users` - Complete user CRUD interface
- **User Creation**: `/users/create` - Create new user form
- **User Viewing**: `/users/$id` - User detail view
- **User Editing**: `/users/$id/edit` - User edit form
- **Settings**: `/settings` - Settings layout
- **Profile Settings**: `/settings/profile` - Profile management
- **Account Settings**: `/settings/account` - Account preferences

## Important Constraints

### Technical Constraints

- **Node.js Version**: Requires Node.js 20+
- **Database**: SQL Server required (not PostgreSQL/MySQL)
- **Package Manager**: Must use pnpm (not npm/yarn)
- **TypeScript**: Strict mode enabled across all packages
- **Browser Support**: Modern browsers with ES2020+ support

### Business Constraints

- **License**: UNLICENSED - proprietary code, cannot be open-sourced
- **Enterprise Requirements**: Must support department-based organization
- **Security Requirements**: Enterprise-grade security with role-based access
- **Performance Requirements**: Must handle large user datasets efficiently

### Deployment Constraints

- **Docker Required**: Production deployment via Docker containers
- **Environment Variables**: All configuration via environment variables
- **Database Migrations**: Required for all schema changes
- **Health Checks**: Both API and web services must have health endpoints

## Current Implementation Status

### Fully Implemented Features ✅

- **User Authentication System**: Complete JWT-based auth with refresh tokens
- **Role-Based Access Control**: Three-tier role system with granular permissions
- **User Management**: Full CRUD operations with role-based restrictions
- **Profile Management**: User profile editing and password changes
- **Dashboard Analytics**: Basic user statistics and activity tracking
- **Mobile Apps Management**: Complete mobile app overview and login history tracking
- **Advanced Architecture**: Core module with shared entity access and dependency inversion
- **Database Integration**: TypeORM with SQL Server integration and ORM-based queries
- **Frontend UI**: React components for all major features with pagination and filtering
- **API Security**: Input validation, CORS, SQL injection prevention
- **Internationalization**: Traditional Chinese localization support
- **Docker Support**: Complete containerization for development and production

### Database Schema (IMPLEMENTED)

- **Table**: `TC_APP_ACCOUNT`
- **Fields**: id, username, password, role, full_name, dept_no, dept_name, is_active, last_login_at, created_at, updated_at
- **Table**: `TC_ACCOUNT_LOGIN`
- **Fields**: \_key (UUID), username, app_id, success, failure_reason, login_at, account_id, app_name, app_version, app_module
- **Table**: `TC_APP_USER`
- **Fields**: id, app_id, app_name, app_version, token, name, company, is_active, userid, username, useremail
- **Role Types**: admin, manager, user (stored as nvarchar)
- **Department Structure**: dept_no (code) and dept_name (display name)
- **Date Format**: All dates use UTC+8 timezone format via `formatDateUTC8()` utility
- **Entity Relationships**: LoginHistory entity maps to TC_ACCOUNT_LOGIN, MobileApp entity maps to TC_APP_USER

### API Endpoints (IMPLEMENTED)

- **Authentication**: `/auth/*` - login, register, refresh, profile, change-password
- **User Management**: `/users/*` - CRUD, search, factory data, profile management
- **Dashboard**: `/dashboard/*` - stats, activity tracking
- **Mobile Apps**: `/mobile-apps/*` - overview, login history with filtering and pagination
- **Role-Based Security**: All endpoints protected with appropriate role checks

### Frontend Features (IMPLEMENTED)

- **Authentication Flow**: Login/logout with token management
- **User Management UI**: Complete interface for user operations
- **Dashboard Interface**: Statistics and activity display
- **Mobile Apps Management**: Complete mobile apps overview and login history interface
- **Settings Pages**: Profile and account management
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Theme Support**: Dark/light mode capability
- **Internationalization**: Traditional Chinese localization support
- **Advanced Tables**: Pagination, filtering, and sorting for large datasets

## External Dependencies

### Database Dependencies

- **SQL Server**: Primary data storage (requires external SQL Server instance)
- **Connection Requirements**: Host, port, username, password configuration
- **Table Structure**: Pre-existing `TC_APP_ACCOUNT` table with specific schema

### Authentication Dependencies

- **JWT Libraries**: jsonwebtoken for token generation/validation
- **Passport Strategies**: passport-jwt and passport-local for authentication
- **bcrypt**: Password hashing for security

### Frontend Dependencies

- **API Client**: Axios for HTTP requests to backend
- **Icon Library**: Lucide React for consistent iconography
- **Theme Provider**: next-themes for dark/light mode support
- **Form Handling**: React Hook Form with Zod validation

### Development Dependencies

- **Docker**: Container runtime for development and production
- **Build Tools**: Vite for frontend, NestJS CLI for backend
- **Code Quality**: ESLint, Prettier, TypeScript for maintainability
- **Testing**: Jest (backend), Vitest (frontend), Testing Library
