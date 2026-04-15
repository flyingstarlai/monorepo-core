import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

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
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingOverlay } from '@/components/ui/loading';

import type { User } from '@repo/api';
import type { CreateUserData, UpdateUserData } from '../types/user.types';

const userFormSchema = z.object({
  username: z.string().min(3, '用戶名長度至少需要3個字元'),
  password: z.string().optional(),
  fullName: z.string().min(2, '全名長度至少需要2個字元'),
  role: z.enum(['admin', 'manager', 'user']),
});

export interface UserFormProps {
  user?: User;
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
  const isAdmin = currentUserRole === 'admin';

  const form = useForm({
    defaultValues: {
      username: user?.username || '',
      password: '',
      fullName: user?.fullName || '',
      role: (user?.role as User['role']) || 'user',
    },
    validators: {
      onSubmit: userFormSchema as any,
      onChange: userFormSchema as any,
    },
    onSubmit: async ({ value }) => {
      const submitData = { ...value };

      if (isEdit && !submitData.password) {
        const { password, ...dataWithoutPassword } = submitData;
        await onSubmit(dataWithoutPassword as UpdateUserData);
        return;
      }

      await onSubmit(submitData as CreateUserData | UpdateUserData);
    },
  });

  return (
    <LoadingOverlay
      isLoading={isLoading}
      message={isEdit ? '更新用戶中...' : '新增用戶中...'}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900">
            {title || (isEdit ? '編輯用戶' : '新增用戶')}
          </CardTitle>
          {description && (
            <CardDescription className="text-slate-600">
              {description}
            </CardDescription>
          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="username"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>用戶名</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isEdit}
                          aria-invalid={isInvalid}
                          placeholder="請輸入用戶名"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

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
                          disabled={isEdit && !isAdmin}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇角色" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">一般用戶</SelectItem>
                            <SelectItem value="manager">維護員</SelectItem>
                            <SelectItem value="admin">系統管理員</SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
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
                {isEdit ? '更新用戶' : '新增用戶'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </LoadingOverlay>
  );
}
