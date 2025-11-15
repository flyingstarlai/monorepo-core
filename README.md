# Account Manager

A comprehensive account management system built with modern web technologies, featuring user authentication, department-based organization, and real-time dashboard analytics.

## Overview

Account Manager is a full-stack application designed to efficiently manage user accounts across departments. It provides secure authentication, comprehensive user management capabilities, and insightful analytics through an intuitive dashboard interface.

## Tech Stack

### Backend

- **NestJS** - Progressive Node.js framework for building efficient APIs
- **TypeORM** - Modern ORM for TypeScript and JavaScript
- **SQL Server** - Enterprise-grade database
- **JWT Authentication** - Secure token-based authentication
- **Passport** - Authentication middleware for Node.js

### Frontend

- **React 19** - Modern React with latest features
- **TanStack Router** - Type-safe routing with data loading
- **TanStack Query** - Powerful data synchronization and server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI components
- **Zod** - TypeScript-first schema validation

### Development Tools

- **Turborepo** - High-performance build system for monorepos
- **TypeScript** - Type-safe JavaScript
- **ESLint & Prettier** - Code quality and formatting
- **Vitest** - Fast unit testing framework

## Features

### 🔐 Authentication & Security

- JWT-based authentication system
- Secure password hashing with bcrypt
- Role-based access control
- Session management with automatic token refresh

### 👥 User Management

- Complete CRUD operations for user accounts
- Department-based organization
- User status management (active/inactive)
- Bulk user operations
- User search and filtering

### 📊 Dashboard Analytics

- Real-time user statistics
- Department-wise user distribution
- User growth analytics
- Recent activity tracking
- Interactive charts and visualizations

### 🎨 Modern UI/UX

- Responsive design for all devices
- Dark/light theme support
- Accessible components following WCAG standards
- Smooth animations and transitions
- Loading states and error handling

## Project Structure

```shell
.
├── apps/
│   ├── api/                       # NestJS backend API
│   │   ├── src/
│   │   │   ├── auth/             # Authentication module
│   │   │   ├── users/            # User management
│   │   │   ├── dashboard/        # Dashboard analytics
│   │   │   ├── database/         # Database configuration
│   │   │   └── migrations/       # Database migrations
│   │   └── test/                 # E2E tests
│   └── web/                      # React frontend
│       ├── src/
│       │   ├── components/       # Reusable UI components
│       │   ├── features/         # Feature-based modules
│       │   ├── hooks/           # Custom React hooks
│       │   ├── lib/             # Utility libraries
│       │   └── routes/          # Route definitions
└── packages/
    ├── api/                     # Shared API types
    ├── eslint-config/          # ESLint configurations
    ├── jest-config/            # Jest configurations
    ├── typescript-config/      # TypeScript configurations
    └── ui/                     # Shared UI components
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm package manager
- SQL Server database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd account-manager
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   ```bash
   cp apps/api/.env.example apps/api/.env
   # Configure your database connection and JWT secrets
   ```

4. **Database setup**

   ```bash
   # Run migrations
   cd apps/api
   pnpm migration:run

   # Seed initial data (optional)
   pnpm seed
   ```

5. **Start development servers**

   ```bash
   # Start both API and web applications
   pnpm dev

   # Or start individually:
   # API: cd apps/api && pnpm dev
   # Web: cd apps/web && pnpm dev
   ```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Available Scripts

### Development

```bash
pnpm dev              # Start all applications in development mode
pnpm dev:api          # Start only the API server
pnpm dev:web          # Start only the web application
```

### Build

```bash
pnpm build            # Build all applications and packages
pnpm build:api        # Build only the API
pnpm build:web        # Build only the web application
```

### Testing

```bash
pnpm test             # Run all test suites
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run end-to-end tests
pnpm test:watch       # Run tests in watch mode
```

### Code Quality

```bash
pnpm lint             # Lint all files
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier
```

### Database Operations

```bash
# From apps/api directory
pnpm migration:generate <name>    # Create new migration
pnpm migration:run               # Run pending migrations
pnpm migration:revert            # Revert last migration
pnpm seed                        # Seed database with initial data
pnpm seed:clear                  # Clear all seed data
```

## API Documentation

### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/change-password` - Change password
- `GET /auth/profile` - Get current user profile

### User Management Endpoints

- `GET /users` - List users with pagination and filtering
- `GET /users/:id` - Get user details
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Dashboard Endpoints

- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/activity` - Get recent activity

## Configuration

### Environment Variables

**API (.env)**

```env
# Database
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=account_manager

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

**Web (.env)**

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Account Manager
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Production Build

```bash
# Build all applications
pnpm build

# Start production servers
pnpm start
```

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens have configurable expiration
- Input validation on all endpoints
- SQL injection prevention via TypeORM
- CORS configuration for API security
- Environment-based configuration management

## Performance Optimizations

- Database query optimization
- React component memoization
- API response caching
- Bundle splitting and lazy loading
- Image optimization and CDN support

## License

This project is licensed under the UNLICENSED license - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team.
