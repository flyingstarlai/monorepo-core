import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  useDefinition,
  useTriggerBuild,
} from '@/features/app-builder/hooks/use-app-builder';
import { LoadingOverlay } from '@/components/ui/loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/app-builder/$id/build')({
  component: AppBuilderBuildPage,
});

function AppBuilderBuildPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: definition, isLoading, error } = useDefinition(id);
  const triggerBuild = useTriggerBuild();
  const [errorState, setErrorState] = useState<string | null>(null);

  const handleTrigger = async () => {
    setErrorState(null);
    try {
      await triggerBuild.mutateAsync({ appDefinitionId: id });
      navigate({ to: '/app-builder' });
    } catch (e: any) {
      const conflict = e?.response?.data?.conflict;
      if (conflict) {
        setErrorState(
          `Another build is already active (Build ID: ${e.response.data.activeBuildId}, Status: ${e.response.data.activeBuildStatus}). Please wait for it to complete.`,
        );
      } else {
        setErrorState('Failed to trigger build. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <LoadingOverlay isLoading={true} message="Loading definition...">
        <div className="h-32" />
      </LoadingOverlay>
    );
  }

  if (error || !definition) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load definition</AlertTitle>
        <AlertDescription>
          Unable to load app definition. Please go back and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/app-builder">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Definitions</span>
        </Button>
      </Link>

      <div>
        <h2 className="text-2xl font-semibold">
          Trigger Build for {definition.appName}
        </h2>
        <div className="text-sm space-y-1 bg-muted p-3 rounded mt-2">
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

      {errorState && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorState}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
        <strong>Note:</strong> Only one build can run at a time. If another
        build is active, this request will be rejected.
      </div>

      <div className="flex gap-2">
        <Link to="/app-builder">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button
          type="button"
          disabled={triggerBuild.isPending}
          onClick={handleTrigger}
        >
          {triggerBuild.isPending ? 'Triggering...' : 'Trigger Build'}
        </Button>
      </div>
    </div>
  );
}
