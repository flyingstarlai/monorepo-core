import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
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
import { useTriggerBuild } from '../hooks/use-app-builder';
import type { MobileAppDefinition } from '../types';

const triggerBuildSchema = z.object({
  parameters: z.string().optional(),
});

type TriggerBuildForm = z.infer<typeof triggerBuildSchema>;

interface TriggerBuildDialogProps {
  definition: MobileAppDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TriggerBuildDialog({
  definition,
  open,
  onOpenChange,
}: TriggerBuildDialogProps) {
  const triggerBuild = useTriggerBuild();
  const [isChecking, setIsChecking] = useState(false);

  const form = useForm<TriggerBuildForm>({
    resolver: zodResolver(triggerBuildSchema),
    defaultValues: {
      parameters: '',
    },
  });

  const onSubmit = async (data: TriggerBuildForm) => {
    try {
      setIsChecking(true);
      await triggerBuild.mutateAsync({
        appDefinitionId: definition.id,
        data: data.parameters ? { parameters: data.parameters } : undefined,
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Failed to trigger build:', error);

      // Handle conflict response
      if (error.response?.data?.conflict) {
        const conflictData = error.response.data;
        alert(
          `Another build is already active:\nBuild ID: ${conflictData.activeBuildId}\nStatus: ${conflictData.activeBuildStatus}\n\nPlease wait for the current build to complete.`,
        );
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Trigger Build for {definition.appName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You are about to trigger a new Android build for{' '}
                <strong>{definition.appName}</strong>.
              </p>
              <div className="text-sm space-y-1 bg-muted p-3 rounded">
                <div>
                  <strong>App ID:</strong> {definition.appId}
                </div>
                <div>
                  <strong>Module:</strong> {definition.appModule}
                </div>
                <div>
                  <strong>Server IP:</strong> {definition.serverIp}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="parameters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Build Parameters (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional build parameters..."
                      className="min-h-[100px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
              <strong>Note:</strong> Only one build can run at a time. If
              another build is active, this request will be rejected.
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={triggerBuild.isPending || isChecking}
              >
                {triggerBuild.isPending || isChecking
                  ? 'Triggering...'
                  : 'Trigger Build'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
