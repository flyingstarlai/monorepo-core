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
import { Search } from 'lucide-react';

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
  username: z.string().min(3, '用戶名長度至少需要3個字元'),
  // Optional here; we enforce required on create via UI
  password: z.string().optional(),
  fullName: z.string().min(2, '全名長度至少需要2個字元'),
  deptNo: z.string().min(1, '部門代碼為必填項目'),
  deptName: z.string().min(2, '部門名稱長度至少需要2個字元'),
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
      message={isEdit ? '更新用戶中...' : '建立用戶中...'}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900">
            {title || (isEdit ? '編輯用戶' : '建立新用戶')}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {description ||
              (isEdit
                ? '更新用戶資訊和權限'
                : '新增一個新用戶到系統並設定適當權限')}
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
                        <FieldLabel htmlFor={field.name}>用戶名</FieldLabel>
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
                            placeholder="請輸入用戶名"
                            className={
                              !isEdit
                                ? 'pr-[3.5rem] border-r-0 focus:border-blue-500'
                                : undefined
                            }
                          />
                          {!isEdit && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute right-0 top-0 h-full z-10 bg-blue-500 border-input text-white hover:bg-blue-500/90 rounded-l-none border-l transition-all duration-200 shadow-sm"
                              onClick={() => setIsDrawerOpen(true)}
                              aria-label="搜尋工廠用戶"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        {!isEdit && (
                          <FieldDescription>
                            按 <Kbd>F2</Kbd> 或點擊搜尋圖示查詢工廠用戶
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
                          密碼 {isEdit && '(留空以保持目前密碼)'}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="請輸入密碼"
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
                        <FieldLabel htmlFor={field.name}>全名</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="請輸入全名"
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
                        <FieldLabel htmlFor={field.name}>部門代碼</FieldLabel>

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
                            placeholder="例如：21110"
                            required
                            className="pr-[3.5rem] border-r-0 focus:border-green-500"
                          />

                          {/* Search button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute right-0 top-0 h-full z-10 px-3 bg-green-500 border-input text-white hover:bg-green-500/90 rounded-l-none border-l transition-all duration-200 shadow-sm"
                            onClick={() => setIsDeptDrawerOpen(true)}
                            aria-label="搜尋工廠部門"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        <FieldDescription>
                          按 <Kbd>F2</Kbd> 或點擊搜尋圖示查詢部門
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
                        <FieldLabel htmlFor={field.name}>部門名稱</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="例如：技術傳承委員會"
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
                          <FieldLabel htmlFor={field.name}>角色</FieldLabel>
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
                              <SelectValue placeholder="選擇角色" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.includes('user') && (
                                <SelectItem value="user">一般用戶</SelectItem>
                              )}
                              {availableRoles.includes('manager') && (
                                <SelectItem value="manager">維護員</SelectItem>
                              )}
                              {availableRoles.includes('admin') && (
                                <SelectItem value="admin">
                                  系統管理員
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                          {!canEditRole && isEdit && (
                            <FieldDescription>
                              只有系統管理員可以更改用戶角色
                            </FieldDescription>
                          )}
                        </Field>
                      );
                    }}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 md:col-span-2">
                    <p className="text-sm text-yellow-800">
                      您的角色沒有權限建立具有特定角色的用戶。
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
                          <FieldLabel htmlFor={field.name}>狀態</FieldLabel>
                          <FieldDescription>
                            啟用或停用用戶帳戶
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
                重設
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEdit ? '更新用戶' : '建立用戶'}
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
