import { createFileRoute } from '@tanstack/react-router';
import { DefinitionForm } from '@/features/app-builder/components/definition-form';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateDefinition } from '@/features/app-builder/hooks/use-app-builder';
import type { CreateDefinitionData } from '@/features/app-builder/components/definition-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

export const Route = createFileRoute('/_authenticated/app-builder/create')({
  component: AppBuilderCreate,
});

function AppBuilderCreate() {
  const createDefinitionMutation = useCreateDefinition();
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
    return (
      <div className="max-w-2xl space-y-4">
        <Alert>
          <AlertDescription>
            App Builder feature is disabled. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSubmit = async (data: CreateDefinitionData) => {
    try {
      await createDefinitionMutation.mutateAsync(data);
      navigate({ to: '/app-builder' });
    } catch (error) {
      console.error('Create definition failed:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <div className="max-w-2xl space-y-4">
        {/* Back Button */}
        <Link to="/app-builder">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回定義列表</span>
          </Button>
        </Link>

        {/* Definition Form */}
        <DefinitionForm
          onSubmit={handleSubmit}
          isLoading={createDefinitionMutation.isPending}
          title="新增應用程式定義"
          description="新增一個新的 Android 應用程式定義，用於建置和部署。"
        />
      </div>
    </div>
  );
}
