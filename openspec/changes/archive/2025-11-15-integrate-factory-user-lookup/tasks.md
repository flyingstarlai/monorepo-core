# Implementation Tasks

## Backend Implementation

### 1. Create Factory User DTO

- [x] Create `apps/api/src/users/dto/factory-user.dto.ts`
- [x] Define FactoryUserDto with fields: username, full_name, dept_no, dept_name
- [x] Add validation decorators for data integrity
- [x] Export DTO for frontend type sharing

### 2. Extend Users Service

- [x] Add `getFactoryUsers()` method to `UsersService`
- [x] Implement stored procedure call using TypeORM query()
- [x] Map procedure results to FactoryUserDto format
- [x] Add error handling and logging

### 3. Extend Users Controller

- [x] Add GET `/users/factory` endpoint
- [x] Apply JWT authentication guard
- [x] Implement proper error responses


### 4. Update Service Registration

- [x] Ensure new service method is properly injected
- [x] Verify module exports include new functionality

## Frontend Implementation

### 5. Add Factory User Types

- [x] Add FactoryUser interface to `user.types.ts`
- [x] Ensure type consistency with backend DTO
- [x] Export interface for component usage

### 6. Create Factory Users Hook

- [x] Add `useFactoryUsers()` hook to `use-users.ts`
- [x] Configure TanStack Query with proper caching
- [x] Implement error handling and loading states
- [x] Add manual refetch capability

### 7. Build User Search Drawer

- [x] Create `user-search-drawer.tsx` component
- [x] Implement right-side slide-out animation
- [x] Add search input field with filtering
- [x] Integrate TanStack Table for data display
- [x] Add keyboard navigation support
- [x] Implement loading and error states
- [x] Add accessibility features (ARIA labels, focus management)

### 8. Create Factory Users Table

- [x] Build table component with sorting capabilities
- [x] Add filtering across all fields
- [x] Implement row selection on click/Enter
- [x] Add hover states and visual feedback
- [x] Handle empty state appropriately
- [x] Ensure responsive design

### 9. Integrate F2 Keyboard Support

- [x] Add F2 key event listener to username field
- [x] Prevent default browser F2 behavior
- [x] Open drawer on F2 press
- [x] Add visual hint for F2 functionality

### 10. Implement Form Auto-Population

- [x] Add user selection handler in drawer
- [x] Auto-populate form fields with selected user data
- [x] Maintain form validation and dirty state tracking
- [x] Close drawer after successful selection

## Integration

### 11. Update User Form Component

- [x] Modify `user-form.tsx` to integrate drawer functionality
- [x] Add drawer state management
- [x] Import and use new hooks and components
- [x] Ensure existing functionality remains unchanged
- [x] Add visual indicators for F2 feature

## Validation and Deployment

### 12. Code Quality

- [x] Run ESLint and fix any issues
- [x] Run Prettier formatting
- [x] Verify TypeScript compilation
- [x] Check for any console errors or warnings
