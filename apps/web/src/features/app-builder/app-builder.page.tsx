import { DefinitionsList } from './components/definitions-list';
import { Link } from '@tanstack/react-router';
import { Button } from '../../components/ui/button';

export function MobileAppBuilderPage() {
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
