import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/enhanced-card';
import { DefinitionCard } from './components/definition-card';
import { FadeIn, SlideUp } from '@/components/ui/motion';
import {
  useDefinitions,
  useDeleteDefinition,
  useJenkinsStatus,
  useJenkinsQueue,
} from './hooks/use-app-builder';
import { DeleteDefinitionDialog } from './components/delete-definition-dialog';
import {
  Smartphone,
  Plus,
  Settings,
  Search,
  Server,
  Activity,
} from 'lucide-react';
import type { MobileAppDefinition } from './types';

export function MobileAppBuilderPage() {
  const { data: definitions, isLoading, error } = useDefinitions();
  const deleteDefinition = useDeleteDefinition();

  const [query, setQuery] = useState('');
  const [deletingDefinition, setDeletingDefinition] =
    useState<MobileAppDefinition | null>(null);

  const { data: jenkinsStatus, isLoading: isJenkinsStatusLoading } =
    useJenkinsStatus();
  const { data: jenkinsQueue, isLoading: isJenkinsQueueLoading } =
    useJenkinsQueue();

  const jenkinsStatusText = isJenkinsStatusLoading
    ? 'Checking...'
    : jenkinsStatus?.connected
      ? 'Connected'
      : 'Disconnected';

  const jenkinsQueueCount = jenkinsQueue?.totalItems ?? 0;
  const jenkinsQueueText = isJenkinsQueueLoading
    ? 'Checking...'
    : `${jenkinsQueueCount} Queued`;

  const filteredDefinitions = useMemo(() => {
    if (!definitions) return [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return definitions;
    return definitions.filter((definition) => {
      const valuesToSearch = [
        definition.appName,
        definition.appId,
        definition.appModule,
        definition.serverIp,
      ];
      return valuesToSearch.some((value) =>
        value?.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [definitions, query]);

  const handleDelete = (def: MobileAppDefinition) => {
    setDeletingDefinition(def);
  };

  // Calculate stats
  const totalApps = definitions?.length || 0;
  const configuredApps =
    definitions?.filter((d) => d.appId && d.appModule).length || 0;
  const recentApps =
    definitions?.filter((d) => {
      const createdAt = new Date(d.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt > weekAgo;
    }).length || 0;

  if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              App Builder feature is disabled. Please contact your
              administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error loading definitions: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Mobile App Builder</h1>
          <p className="text-muted-foreground text-lg">
            Create and manage Android mobile app definitions, trigger builds,
            and download artifacts.
          </p>
        </div>

        {/* Stats Overview */}
        <SlideUp delay={100}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Apps"
              value={totalApps}
              icon={Smartphone}
              trend={{
                value: recentApps > 0 ? `+${recentApps}` : '0',
                direction: recentApps > 0 ? 'up' : 'neutral',
              }}
            />

            <StatCard
              title="Configured"
              value={configuredApps}
              icon={Settings}
              trend={{
                value: 'Ready',
                direction: 'neutral',
              }}
            />

            <StatCard
              title="Jenkins Status"
              value={jenkinsStatusText}
              icon={Server}
              trend={{
                value: 'Status',
                direction: 'neutral',
              }}
            />
            <StatCard
              title="Build Queue"
              value={jenkinsQueueText}
              icon={Activity}
              trend={{
                value: 'Queue',
                direction: 'neutral',
              }}
            />
          </div>
        </SlideUp>

        {/* Definitions Grid */}
        <div>
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold">App Definitions</h2>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <div className="relative md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search definitions..."
                  className="pl-9"
                  aria-label="Search definitions"
                />
              </div>
              <Button size="sm" asChild className="md:w-auto">
                <Link to="/app-builder/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : filteredDefinitions.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredDefinitions.map((definition) => (
                <DefinitionCard
                  key={definition.id}
                  definition={definition}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <FadeIn delay={300}>
              <Card>
                <CardContent className="text-center py-12">
                  <Smartphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {query.trim()
                      ? 'No Matching Definitions'
                      : 'No App Definitions'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {query.trim()
                      ? 'Try adjusting your search terms.'
                      : 'Get started by creating your first mobile app definition. Configure your app settings and trigger builds.'}
                  </p>
                  {!query.trim() && (
                    <Button size="lg" asChild>
                      <Link to="/app-builder/create">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First App
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {deletingDefinition && (
          <DeleteDefinitionDialog
            definition={deletingDefinition}
            open={!!deletingDefinition}
            onOpenChange={(open) => !open && setDeletingDefinition(null)}
            onConfirm={async () => {
              try {
                await deleteDefinition.mutateAsync(deletingDefinition.id);
              } finally {
                setDeletingDefinition(null);
              }
            }}
            isDeleting={deleteDefinition.isPending}
          />
        )}
      </div>
    </div>
  );
}
