# Project Context

## Purpose

Account Manager is a comprehensive account management system designed to efficiently manage user accounts across departments. It provides secure authentication, comprehensive user management capabilities, and insightful analytics through an intuitive dashboard interface. The system enables organizations to maintain organized user records with role-based access control and real-time analytics.

## Tech Stack

- **Backend**: NestJS, TypeORM, SQL Server, JWT Authentication, Passport
- **Frontend**: React 19, TanStack Router, TanStack Query, Tailwind CSS, Radix UI, Zod
- **Development**: TypeScript, Turborepo, pnpm, ESLint, Prettier, Vitest
- **Database**: Microsoft SQL Server with TypeORM migrations
- **UI Components**: shadcn/ui (New York style), Lucide icons
- **State Management**: Zustand, TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tools**: Vite (frontend), NestJS CLI (backend)

## Project Conventions

### Code Style

- TypeScript with strict type checking
- ESLint with custom configuration allowing `any` for initial conversion
- Prettier for consistent formatting
- Component-based architecture with feature folders
- PascalCase for components, camelCase for variables/functions
- Use of workspace packages for shared configurations

### Architecture Patterns

- **Monorepo structure** using Turborepo and pnpm workspaces
- **Feature-based organization** in both frontend and backend
- **Clean Architecture** with separation of concerns (controllers, services, entities)
- **Repository Pattern** via TypeORM
- **Dependency Injection** using NestJS DI container
- **Route-based code splitting** with TanStack Router

### Testing Strategy

- **Unit Tests**: Vitest for frontend, Jest for backend
- **E2E Tests**: Jest with Supertest for API testing
- **Testing Library**: React Testing Library for component testing
- **Test Configuration**: Shared Jest configs in workspace packages
- **Coverage**: Comprehensive test coverage required for new features

### Git Workflow

- **Branching**: Feature branches from main (`feature/feature-name`)
- **Commits**: Conventional commit messages
- **Code Review**: Required for all changes
- **Automated**: Linting, formatting, and testing on pre-commit hooks

## Domain Context

- **User Management**: CRUD operations for user accounts with department-based organization
- **Authentication**: JWT-based authentication with role-based access control
- **Departments**: Hierarchical organization structure for user grouping
- **Dashboard Analytics**: Real-time statistics and user activity tracking
- **Roles**: Role-based permissions (admin, manager, user, etc.)
- **Status Management**: User status tracking (active/inactive/suspended)

## Important Constraints

- **Security**: All passwords hashed with bcrypt, JWT tokens with expiration
- **Database**: SQL Server required, migrations managed via TypeORM
- **Node.js**: Version 20+ required
- **Package Manager**: pnpm exclusively for dependency management
- **Environment**: Separate configurations for development and production
- **Accessibility**: WCAG compliance required for UI components
- **Performance**: Optimized for enterprise-scale user management

## External Dependencies

- **Database**: Microsoft SQL Server instance
- **Authentication**: JWT token management with configurable secrets
- **Email**: Potential integration for user notifications (future)
- **File Storage**: Local file system for user avatars/uploads
- **API Gateway**: Potential future integration with external systems
- **Monitoring**: Web Vitals tracking for performance metrics
