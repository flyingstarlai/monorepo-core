import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useModules, useAppIds } from '../hooks/use-app-builder';

const createDefinitionSchema = z.object({
  appName: z.string().min(1, 'App name is required'),
  appId: z.string().min(1, 'App ID is required'),
  appModule: z.string().min(1, 'App module is required'),
  serverIp: z.string().min(1, 'Server IP is required'),
});

export type CreateDefinitionData = z.infer<typeof createDefinitionSchema>;

interface DefinitionFormProps {
  onSubmit: (data: CreateDefinitionData) => Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
  defaultValues?: Partial<CreateDefinitionData>;
}

export function DefinitionForm({
  onSubmit,
  isLoading = false,
  title = 'Create Mobile App Definition',
  description = 'Create a new Android app definition for building and deployment.',
  defaultValues,
}: DefinitionFormProps) {
  const { data: modules } = useModules();
  const { data: appIds } = useAppIds();

  const form = useForm<CreateDefinitionData>({
    resolver: zodResolver(createDefinitionSchema),
    defaultValues: {
      appName: '',
      appId: '',
      appModule: '',
      serverIp: '',
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: CreateDefinitionData) => {
    await onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="appName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter app name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App ID</FormLabel>
                <FormControl>
                  <Combobox
                    options={
                      appIds?.map((appId) => ({
                        value: appId.appId,
                        label: `${appId.appId} (${appId.packageName})`,
                      })) || []
                    }
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select app ID from Google Services"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appModule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App Module</FormLabel>
                <FormControl>
                  <Combobox
                    options={
                      modules?.map((module) => ({
                        value: module.id,
                        label: `${module.name} (${module.id})`,
                      })) || []
                    }
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select app module"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serverIp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server IP</FormLabel>
                <FormControl>
                  <Input placeholder="Enter server IP address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Definition'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
