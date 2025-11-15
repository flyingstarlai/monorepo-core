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
  FieldContent,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading';
import { useLogin } from '../hooks/use-auth';

// Enhanced Zod schema with better validation
const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_@.-]+$/,
      'Username can only contain letters, numbers, and @._-',
    ),
  password: z
    .string()
    .min(3, 'Password must be at least 3 characters')
    .max(100, 'Password must be less than 100 characters'),
});

export function LoginForm() {
  const loginMutation = useLogin();

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await loginMutation.mutateAsync(value);
        // Navigation is handled automatically by login hook
      } catch (error) {
        // Error is handled by the mutation with enhanced messages
        console.error('Login failed:', error);
      }
    },
  });

  return (
    <LoadingOverlay isLoading={loginMutation.isPending} message="Signing in...">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <FieldContent>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
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
                              : error?.message || 'Invalid username',
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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <FieldContent>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        required
                        autoComplete="current-password"
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
                              : error?.message || 'Invalid password',
                        }))}
                      />
                    )}
                  </Field>
                );
              }}
            />

            {/* Enhanced error display */}
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
                      Authentication failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {(() => {
                        const error = loginMutation.error;

                        // Enhanced error messages based on error type
                        if (error?.message) {
                          const message = error.message;
                          if (message.includes('disabled')) {
                            return 'Your account has been disabled. Please contact support.';
                          }
                          if (message.includes('expired')) {
                            return 'Your session has expired. Please log in again.';
                          }
                          return message;
                        }

                        // Handle API response errors
                        if (
                          error &&
                          typeof error === 'object' &&
                          'response' in error
                        ) {
                          const apiError = error as any;
                          if (apiError?.response?.data?.message) {
                            return apiError.response.data.message;
                          }
                          if (apiError?.response?.data?.error) {
                            return apiError.response.data.error;
                          }
                        }

                        return 'Invalid username or password. Please try again.';
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
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </LoadingOverlay>
  );
}
