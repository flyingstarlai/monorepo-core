import { DefinitionsList } from './components/definitions-list';
import { Link } from '@tanstack/react-router';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export function MobileAppBuilderPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            App Builder feature is disabled. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mobile App Builder</h1>
        <p className="text-muted-foreground">
          Create and manage Android mobile app definitions, trigger builds, and
          download artifacts.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div />
        <Link to="/app-builder/identifier">
          <Button variant="outline">Manage Identifiers</Button>
        </Link>
      </div>

      <DefinitionsList />
    </div>
  );
}
