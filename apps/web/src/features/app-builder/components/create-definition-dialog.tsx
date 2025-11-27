import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { useCreateDefinition } from '../hooks/use-app-builder';
import { DefinitionForm, type CreateDefinitionData } from './definition-form';

interface CreateDefinitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDefinitionDialog({
  open,
  onOpenChange,
}: CreateDefinitionDialogProps) {
  const createDefinition = useCreateDefinition();

  const handleSubmit = async (data: CreateDefinitionData) => {
    try {
      await createDefinition.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create definition:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Mobile App Definition</DialogTitle>
        </DialogHeader>

        <DefinitionForm
          onSubmit={handleSubmit}
          isLoading={createDefinition.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
