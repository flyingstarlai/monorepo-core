import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Combobox } from '../../../components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import {
  useUpdateDefinition,
  useModules,
  useAppIds,
} from '../hooks/use-app-builder';
import type { MobileAppDefinition } from '../types';

const updateDefinitionSchema = z.object({
  appName: z.string().min(1, 'App name is required').optional(),
  appId: z.string().min(1, 'App ID is required').optional(),
  appModule: z.string().min(1, 'App module is required').optional(),
  serverIp: z.string().min(1, 'Server IP is required').optional(),
});

type UpdateDefinitionForm = z.infer<typeof updateDefinitionSchema>;

interface EditDefinitionDialogProps {
  definition: MobileAppDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDefinitionDialog({
  definition,
  open,
  onOpenChange,
}: EditDefinitionDialogProps) {
  const { data: modules } = useModules();
  const { data: appIds } = useAppIds();
  const updateDefinition = useUpdateDefinition();

  const form = useForm<UpdateDefinitionForm>({
    resolver: zodResolver(updateDefinitionSchema),
    defaultValues: {
      appName: definition.appName,
      appId: definition.appId,
      appModule: definition.appModule,
      serverIp: definition.serverIp,
    },
  });

  useEffect(() => {
    if (definition) {
      form.reset({
        appName: definition.appName,
        appId: definition.appId,
        appModule: definition.appModule,
        serverIp: definition.serverIp,
      });
    }
  }, [definition, form]);

  const onSubmit = async (data: UpdateDefinitionForm) => {
    try {
      // Only include fields that have values
      const updateData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== '' && value !== undefined,
        ),
      );

      await updateDefinition.mutateAsync({
        id: definition.id,
        data: updateData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update definition:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Mobile App Definition</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        appIds?.map((appId: any) => ({
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateDefinition.isPending}>
                {updateDefinition.isPending
                  ? 'Updating...'
                  : 'Update Definition'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
