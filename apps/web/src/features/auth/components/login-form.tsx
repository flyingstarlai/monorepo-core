import { useForm } from '@tanstack/react-form';
import { useState, useEffect } from 'react';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldError,
  FieldLabel,
  FieldContent,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading';
import { useLogin } from '../hooks/use-auth';

const REMEMBERED_USERNAME_KEY = 'remembered_username';

const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, '用戶名為必填項目')
    .max(50, '用戶名長度不能超過50個字元')
    .regex(/^[a-zA-Z0-9_@.-]+$/, '用戶名只能包含字母、數字和@._-'),
  password: z
    .string()
    .min(3, '密碼長度至少需要3個字元')
    .max(100, '密碼長度不能超過100個字元'),
});

export function LoginForm() {
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_USERNAME_KEY);
    if (saved) {
      setRememberMe(true);
    }
  }, []);

  const form = useForm({
    defaultValues: {
      username: localStorage.getItem(REMEMBERED_USERNAME_KEY) || '',
      password: '',
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_USERNAME_KEY, value.username);
      } else {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY);
      }

      try {
        await loginMutation.mutateAsync(value);
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
  });

  return (
    <LoadingOverlay isLoading={loginMutation.isPending} message="登入中...">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">歡迎回來</h2>
          <p className="mt-2 text-sm text-slate-500">登入您的帳戶以繼續</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          <form.Field
            name="username"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="username">用戶名</FieldLabel>
                  <FieldContent>
                    <Input
                      id="username"
                      type="text"
                      placeholder="請輸入您的用戶名"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      required
                      autoComplete="username"
                      className={
                        isInvalid ? 'border-red-500 focus:border-red-500' : ''
                      }
                    />
                  </FieldContent>
                  {isInvalid && (
                    <FieldError
                      errors={field.state.meta.errors.map((error) => ({
                        message:
                          typeof error === 'string'
                            ? error
                            : error?.message || '無效的用戶名',
                      }))}
                    />
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
                  <FieldLabel htmlFor="password">密碼</FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="請輸入您的密碼"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        required
                        autoComplete="current-password"
                        className={`pr-10 ${isInvalid ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FieldContent>
                  {isInvalid && (
                    <FieldError
                      errors={field.state.meta.errors.map((error) => ({
                        message:
                          typeof error === 'string'
                            ? error
                            : error?.message || '無效的密碼',
                      }))}
                    />
                  )}
                </Field>
              );
            }}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <label
              htmlFor="remember"
              className="text-sm text-slate-600 cursor-pointer select-none"
            >
              記住我
            </label>
          </div>

          {loginMutation.error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 7.293a1 1 0 00-1.414 1.414l1.414 1.414a1 1 0 001.414 1.414l-1.414-1.414a1 1 0 00-1.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    身份驗證失敗
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {(() => {
                      const error = loginMutation.error;
                      if (error?.message) {
                        const message = error.message;
                        if (message.includes('disabled'))
                          return '您的帳戶已被停用。請聯繫支援團隊。';
                        if (message.includes('expired'))
                          return '您的會話已過期。請重新登入。';
                        return message;
                      }
                      if (
                        error &&
                        typeof error === 'object' &&
                        'response' in error
                      ) {
                        const apiError = error as any;
                        if (apiError?.response?.data?.message)
                          return apiError.response.data.message;
                        if (apiError?.response?.data?.error)
                          return apiError.response.data.error;
                      }
                      return '無效的用戶名或密碼。請重試。';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? '登入中...' : '登入'}
          </Button>
        </form>
      </div>
    </LoadingOverlay>
  );
}
