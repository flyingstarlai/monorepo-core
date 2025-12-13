import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Group } from '../types/group.types';

type GroupFormResult = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};

interface GroupFormDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GroupFormResult) => Promise<void> | void;
  isSubmitting: boolean;
  group?: Group | null;
}

const formSchema = z.object({
  name: z.string().min(1, '請輸入群組名稱').max(100, '名稱最多 100 個字'),
  description: z
    .string()
    .max(255, '描述最多 255 個字')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
});

type GroupFormValues = z.infer<typeof formSchema>;

export function GroupFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  group,
}: GroupFormDialogProps) {
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name ?? '',
      description: group?.description ?? '',
      isActive: group?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: group?.name ?? '',
        description: group?.description ?? '',
        isActive: group?.isActive ?? true,
      });
    }
  }, [group, open, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      description: values.description?.trim()
        ? values.description.trim()
        : null,
      isActive: mode === 'edit' ? values.isActive : undefined,
    });
  });

  const title = mode === 'create' ? '建立新群組' : '編輯群組';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>群組名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="輸入群組名稱" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="可選填，用於說明群組用途"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">啟用狀態</FormLabel>
                      <p className="text-muted-foreground text-sm">
                        停用後仍保留群組，但無法再新增成員
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '儲存中...' : '儲存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
