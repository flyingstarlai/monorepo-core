import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  useBuilds,
  useDownloadArtifact,
  useDefinitions,
  useModules,
} from '../hooks/use-app-builder';
import type { MobileAppDefinition, MobileAppBuild } from '../types';
import { useAuth } from '../../../features/auth/hooks/use-auth';
import { BuildHistoryTable } from './build-history-table';
import {
  BuildHistoryFilters,
  type BuildFilters,
} from './build-history-filters';
import { BuildErrorDisplay } from './build-error-display';
import { BuildHistoryDetailDrawer } from './build-history-detail-drawer';
// import { BuildComparisonTool } from './BuildComparisonTool';
// import { BuildAnalyticsDashboard } from './BuildAnalyticsDashboard';
// import { BuildActionButtons } from './build-action-buttons';

interface BuildHistoryDialogProps {
  definition?: MobileAppDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'app' | 'global';
}

export function BuildHistoryDialog({
  definition,
  open,
  onOpenChange,
  mode = 'app',
}: BuildHistoryDialogProps) {
  const [activeTab, setActiveTab] = useState('history');
  const [filters, setFilters] = useState<BuildFilters>({
    statuses: [],
    appIds: [],
    modules: [],
  });
  const [selectedBuilds, setSelectedBuilds] = useState<string[]>([]);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedBuildForDetail, setSelectedBuildForDetail] =
    useState<MobileAppBuild | null>(null);

  // Global builds for mode='global', app-specific for mode='app'
  const {
    data: builds,
    isLoading,
    refetch,
  } = useBuilds(mode === 'app' && definition ? definition.id : undefined);
  const { data: definitions } = useDefinitions();
  const { data: modules } = useModules();
  const downloadArtifact = useDownloadArtifact();
  const { user } = useAuth();

  const handleDownload = async (build: MobileAppBuild) => {
    if (build.status !== 'completed') {
      alert('Only completed builds can be downloaded');
      return;
    }

    if (!['admin', 'manager'].includes(user?.role || '')) {
      alert('Only admin and manager users can download artifacts');
      return;
    }

    try {
      const response = await downloadArtifact.mutateAsync(build.id);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = response.url;
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download artifact:', error);
      alert('Failed to download artifact');
    }
  };

  const handleBuildAction = async (build: MobileAppBuild, action: string) => {
    switch (action) {
      case 'download':
        await handleDownload(build);
        break;
      case 'view':
        setSelectedBuildForDetail(build);
        break;
      case 'retry':
        // Handle retry build
        break;
      case 'cancel':
        // Handle cancel build
        break;
      case 'compare':
        setSelectedBuilds((prev) => [...prev, build.id]);
        setActiveTab('compare');
        break;
      case 'delete':
        // Handle delete build
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const filteredBuilds = builds?.filter((build: MobileAppBuild) =>
    mode === 'app' && definition
      ? build.appDefinitionId === definition.id
      : true,
  );

  const handleFiltersChange = (newFilters: BuildFilters) => {
    setFilters(newFilters);
    refetch();
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Build History -{' '}
              {mode === 'app' && definition ? definition.appName : 'All Builds'}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>

            <div className="overflow-auto flex-1 mt-4">
              <TabsContent value="history" className="space-y-4">
                <BuildHistoryTable
                  builds={filteredBuilds || []}
                  definitions={definitions || []}
                  isLoading={isLoading}
                  onBuildAction={handleBuildAction}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  selectedBuildIds={selectedBuilds}
                  onSelectionChange={setSelectedBuilds}
                />
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <BuildHistoryFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  definitions={definitions || []}
                  modules={modules || []}
                  onReset={() => {
                    setFilters({
                      statuses: [],
                      appIds: [],
                      modules: [],
                    });
                    refetch();
                  }}
                />
              </TabsContent>

              <TabsContent value="compare" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Build comparison tool coming soon
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Build analytics dashboard coming soon
                </div>
              </TabsContent>

              <TabsContent value="errors" className="space-y-4">
                <div className="grid gap-4">
                  {filteredBuilds
                    ?.filter(
                      (build: MobileAppBuild) => build.status === 'failed',
                    )
                    .map((build: MobileAppBuild) => (
                      <BuildErrorDisplay
                        key={build.id}
                        build={build as MobileAppBuild}
                        onRetry={(build: MobileAppBuild) =>
                          handleBuildAction(build, 'retry')
                        }
                        onViewFullLog={(build: MobileAppBuild) => {
                          if (build.consoleUrl) {
                            window.open(build.consoleUrl, '_blank');
                          }
                        }}
                      />
                    ))}
                  {(!filteredBuilds ||
                    filteredBuilds.filter(
                      (build: MobileAppBuild) => build.status === 'failed',
                    ).length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No failed builds found in the current time range
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <BuildHistoryDetailDrawer
        build={selectedBuildForDetail}
        open={!!selectedBuildForDetail}
        onOpenChange={(open) => !open && setSelectedBuildForDetail(null)}
      />
    </>
  );
}
