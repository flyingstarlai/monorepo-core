import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingOverlay } from '@/components/ui/loading';
import { Kbd } from '@/components/ui/kbd';
import { UserSearchDrawer } from './user-search-drawer';
import { DepartmentSearchDrawer } from './department-search-drawer';

import type {
  FactoryUser,
  FactoryDepartment,
  User,
  CreateUserData,
  UpdateUserData,
} from '../types/user.types';
import { RoleService } from '@/lib/role.service';

// Zod schema for validation
const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  // Optional here; we enforce required on create via UI
  password: z.string().optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  deptNo: z.string().min(1, 'Department code is required'),
  deptName: z.string().min(2, 'Department name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'user']),
  isActive: z.boolean(),
});

export interface UserFormProps {
  user?: User; // For edit mode
  onSubmit: (data: CreateUserData | UpdateUserData) => void | Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
  currentUserRole?: User['role'];
}

export function UserForm({
  user,
  onSubmit,
  isLoading = false,
  title,
  description,
  currentUserRole,
}: UserFormProps) {
  const isEdit = !!user;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeptDrawerOpen, setIsDeptDrawerOpen] = useState(false);

  // Get available role options based on current user's role
  const availableRoles =
    RoleService.getAvailableRolesForCreation(currentUserRole);
  const canSelectRole = availableRoles.length > 0;
  const canEditRole = currentUserRole === 'admin';

  const form = useForm({
    defaultValues: {
      username: user?.username || '',
      password: '',
      fullName: user?.fullName || '',
      deptNo: user?.deptNo || '',
      deptName: user?.deptName || '',
      role:
        (user?.role as User['role']) ||
        (availableRoles[0] as User['role']) ||
        'user',
      isActive: user?.isActive ?? true,
    },
    validators: {
      onSubmit: userFormSchema as any,
      onChange: userFormSchema as any,
    },
    onSubmit: async ({ value }) => {
      const submitData = { ...value };

      // In edit mode, if password is empty, don't send it
      if (isEdit && !submitData.password) {
        const { password, ...dataWithoutPassword } = submitData;
        await onSubmit(dataWithoutPassword as UpdateUserData);
        return;
      }

      await onSubmit(submitData as CreateUserData | UpdateUserData);
    },
  });

  // Handle user selection from drawer
  const handleUserSelect = (selectedUser: FactoryUser) => {
    form.setFieldValue('username', selectedUser.username);
    form.setFieldValue('fullName', selectedUser.fullName);
    form.setFieldValue('deptNo', selectedUser.deptNo);
    form.setFieldValue('deptName', selectedUser.deptName);
    setIsDrawerOpen(false);
  };

  // Handle department selection from drawer
  const handleDepartmentSelect = (selectedDepartment: FactoryDepartment) => {
    form.setFieldValue('deptNo', selectedDepartment.deptNo);
    form.setFieldValue('deptName', selectedDepartment.deptName);
    setIsDeptDrawerOpen(false);
  };

  return (
    <LoadingOverlay
      isLoading={isLoading}
      message={isEdit ? 'Updating user...' : 'Creating user...'}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900">
            {title || (isEdit ? 'Edit User' : 'Create New User')}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {description ||
              (isEdit
                ? 'Update user information and permissions'
                : 'Add a new user to system with appropriate permissions')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <FieldGroup>
              {/* Single grid for all fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <form.Field
                  name="username"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                        <div className="relative">
                          <Input
                            id="username-field"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'F2') {
                                e.preventDefault();
                                setIsDrawerOpen(true);
                              }
                            }}
                            disabled={isEdit}
                            aria-invalid={isInvalid}
                            placeholder="Enter username"
                            className={!isEdit ? 'pr-12' : undefined}
                          />
                          {!isEdit && (
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
                              <Kbd>F2</Kbd>
                            </div>
                          )}
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        {!isEdit && (
                          <FieldDescription>
                            Press <Kbd>F2</Kbd> to lookup factory users
                          </FieldDescription>
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Password */}
                <form.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Password {isEdit && '(leave blank to keep current)'}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter password"
                          required={!isEdit}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Full Name */}
                <form.Field
                  name="fullName"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter full name"
                          required
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Dept Code */}
                {/* Dept Code */}
                <form.Field
                  name="deptNo"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Department Code
                        </FieldLabel>

                        <div className="relative">
                          <Input
                            id="deptno-field"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'F2') {
                                e.preventDefault();
                                setIsDeptDrawerOpen(true);
                              }
                            }}
                            aria-invalid={isInvalid}
                            placeholder="e.g., 21110"
                            required
                            className="pr-12"
                          />

                          {/* F2 suffix */}
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
                            <Kbd>F2</Kbd>
                          </div>
                        </div>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        <FieldDescription>
                          Press <Kbd>F2</Kbd> to lookup department
                        </FieldDescription>
                      </Field>
                    );
                  }}
                />

                {/* Dept Name */}
                <form.Field
                  name="deptName"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Department Name
                        </FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g., 技術傳承委員會"
                          required
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Role / Role Warning */}
                {canSelectRole ? (
                  <form.Field
                    name="role"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(
                                value as 'admin' | 'manager' | 'user',
                              )
                            }
                            disabled={isEdit && !canEditRole}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.includes('user') && (
                                <SelectItem value="user">User</SelectItem>
                              )}
                              {availableRoles.includes('manager') && (
                                <SelectItem value="manager">Manager</SelectItem>
                              )}
                              {availableRoles.includes('admin') && (
                                <SelectItem value="admin">Admin</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                          {!canEditRole && isEdit && (
                            <FieldDescription>
                              Only administrators can change user roles
                            </FieldDescription>
                          )}
                        </Field>
                      );
                    }}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 md:col-span-2">
                    <p className="text-sm text-yellow-800">
                      Your role doesn&apos;t have permission to create users
                      with specific roles.
                    </p>
                  </div>
                )}

                {/* Status */}
                <form.Field
                  name="isActive"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field
                        orientation="horizontal"
                        data-invalid={isInvalid}
                        className="md:col-span-2"
                      >
                        <FieldContent>
                          <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                          <FieldDescription>
                            Enable or disable user account
                          </FieldDescription>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </FieldContent>
                        <Checkbox
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked === true)
                          }
                        />
                      </Field>
                    );
                  }}
                />
              </div>
            </FieldGroup>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEdit ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* User Search Drawer */}
      <UserSearchDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUserSelect={handleUserSelect}
      />

      {/* Department Search Drawer */}
      <DepartmentSearchDrawer
        isOpen={isDeptDrawerOpen}
        onClose={() => setIsDeptDrawerOpen(false)}
        onDepartmentSelect={handleDepartmentSelect}
      />
    </LoadingOverlay>
  );
}
