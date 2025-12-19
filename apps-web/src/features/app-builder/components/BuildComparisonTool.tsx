import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  GitCompare,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { MobileAppBuild, MobileAppDefinition } from '../types';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '../../../lib/utils';

interface BuildComparisonToolProps {
  builds: MobileAppBuild[];
  definitions: MobileAppDefinition[];
  onBuildSelect?: (builds: MobileAppBuild[]) => void;
  onClose?: () => void;
}

interface ComparisonData {
  builds: [MobileAppBuild, MobileAppBuild];
  definitions: [MobileAppDefinition, MobileAppDefinition];
}

interface ComparisonField {
  label: string;
  key: string;
  type: 'text' | 'status' | 'duration' | 'timestamp' | 'boolean';
  getValue?: (
    build: MobileAppBuild,
    definition?: MobileAppDefinition,
  ) => string | number | boolean;
  format?: (value: any) => string;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'building':
      return <Play className="h-4 w-4 text-blue-500" />;
    case 'queued':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
}

function formatDuration(build: MobileAppBuild): string {
  if (!build.startedAt) return 'N/A';

  const endTime = build.completedAt ? new Date(build.completedAt) : new Date();
  const startTime = new Date(build.startedAt);
  const duration = endTime.getTime() - startTime.getTime();

  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) return `${Math.round(duration / 1000)}s`;
  return `${Math.round(duration / 60000)}m ${Math.round((duration % 60000) / 1000)}s`;
}

function calculatePerformanceMetrics(builds: [MobileAppBuild, MobileAppBuild]) {
  const [build1, build2] = builds;

  const metrics = {
    durationDifference: 0,
    statusChange: false,
    jenkinsBuildNumberDifference: 0,
    timeDifference: 0,
  };

  if (build1.startedAt && build2.startedAt) {
    const start1 = new Date(build1.startedAt).getTime();
    const start2 = new Date(build2.startedAt).getTime();
    metrics.timeDifference = Math.abs(start2 - start1);
  }

  if (
    build1.completedAt &&
    build2.completedAt &&
    build1.startedAt &&
    build2.startedAt
  ) {
    const duration1 =
      new Date(build1.completedAt).getTime() -
      new Date(build1.startedAt).getTime();
    const duration2 =
      new Date(build2.completedAt).getTime() -
      new Date(build2.startedAt).getTime();
    metrics.durationDifference = duration2 - duration1;
  }

  metrics.statusChange = build1.status !== build2.status;

  if (build1.jenkinsBuildNumber && build2.jenkinsBuildNumber) {
    metrics.jenkinsBuildNumberDifference =
      build2.jenkinsBuildNumber - build1.jenkinsBuildNumber;
  }

  return metrics;
}

function ComparisonTable({
  data,
  metrics,
}: {
  data: ComparisonData;
  metrics: ReturnType<typeof calculatePerformanceMetrics>;
}) {
  const { builds, definitions } = data;
  const [build1, build2] = builds;
  const [def1, def2] = definitions;

  const fields: ComparisonField[] = [
    {
      label: 'Build ID',
      key: 'id',
      type: 'text',
      getValue: (build) => build.id.slice(-8),
    },
    {
      label: 'App Name',
      key: 'appName',
      type: 'text',
      getValue: (build, definition) => definition?.appName || 'N/A',
    },
    {
      label: 'App ID',
      key: 'appId',
      type: 'text',
      getValue: (build, definition) => definition?.appId || 'N/A',
    },
    {
      label: 'Module',
      key: 'appModule',
      type: 'text',
      getValue: (build, definition) => definition?.appModule || 'N/A',
    },
    {
      label: 'Server IP',
      key: 'serverIp',
      type: 'text',
      getValue: (build, definition) => definition?.serverIp || 'N/A',
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status',
      getValue: (build) => build.status,
    },
    {
      label: 'Duration',
      key: 'duration',
      type: 'duration',
      getValue: (build) => formatDuration(build),
    },
    {
      label: 'Started',
      key: 'startedAt',
      type: 'timestamp',
      getValue: (build) =>
        build.startedAt ? format(new Date(build.startedAt), 'PPp') : 'N/A',
    },
    {
      label: 'Completed',
      key: 'completedAt',
      type: 'timestamp',
      getValue: (build) =>
        build.completedAt ? format(new Date(build.completedAt), 'PPp') : 'N/A',
    },
    {
      label: 'Started By',
      key: 'startedBy',
      type: 'text',
      getValue: (build) => build.startedBy,
    },
    {
      label: 'Build Number',
      key: 'jenkinsBuildNumber',
      type: 'text',
      getValue: (build) => build.jenkinsBuildNumber?.toString() || 'N/A',
    },
    {
      label: 'Has Artifact',
      key: 'artifactPath',
      type: 'boolean',
      getValue: (build) => !!build.artifactPath,
    },
  ];

  const renderFieldValue = (
    field: ComparisonField,
    build: MobileAppBuild,
    definition?: MobileAppDefinition,
  ) => {
    const value = field.getValue
      ? field.getValue(build, definition)
      : (build as any)[field.key];

    if (field.type === 'status') {
      return (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value as string)}
          <Badge
            variant={
              value === 'completed'
                ? 'default'
                : value === 'failed'
                  ? 'destructive'
                  : value === 'building'
                    ? 'default'
                    : 'secondary'
            }
          >
            {(value as string).toUpperCase()}
          </Badge>
        </div>
      );
    }

    if (field.type === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'YES' : 'NO'}
        </Badge>
      );
    }

    return (
      <span className={field.type === 'duration' ? 'font-mono' : ''}>
        {value}
      </span>
    );
  };

  const hasDifference = (field: ComparisonField) => {
    const value1 = field.getValue
      ? field.getValue(build1, def1)
      : (build1 as any)[field.key];
    const value2 = field.getValue
      ? field.getValue(build2, def2)
      : (build2 as any)[field.key];
    return value1 !== value2;
  };

  return (
    <div className="space-y-4">
      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.timeDifference > 0 ? '+' : ''}
                {Math.round(metrics.timeDifference / 1000)}s
              </div>
              <div className="text-sm text-muted-foreground">
                Time Difference
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  'text-2xl font-bold',
                  metrics.durationDifference > 0
                    ? 'text-red-600'
                    : metrics.durationDifference < 0
                      ? 'text-green-600'
                      : 'text-gray-600',
                )}
              >
                {metrics.durationDifference > 0 ? '+' : ''}
                {Math.round(metrics.durationDifference / 1000)}s
              </div>
              <div className="text-sm text-muted-foreground">
                Duration Difference
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  'text-2xl font-bold',
                  metrics.jenkinsBuildNumberDifference > 0
                    ? 'text-blue-600'
                    : 'text-gray-600',
                )}
              >
                +{metrics.jenkinsBuildNumberDifference}
              </div>
              <div className="text-sm text-muted-foreground">
                Build Number Gap
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  'text-2xl font-bold',
                  metrics.statusChange ? 'text-orange-600' : 'text-green-600',
                )}
              >
                {metrics.statusChange ? 'Changed' : 'Same'}
              </div>
              <div className="text-sm text-muted-foreground">Status Change</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Field</TableHead>
                  <TableHead className="text-center">
                    Build 1 ({build1.id.slice(-8)})
                  </TableHead>
                  <TableHead className="w-16"></TableHead>
                  <TableHead className="text-center">
                    Build 2 ({build2.id.slice(-8)})
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => {
                  const isDifferent = hasDifference(field);
                  return (
                    <TableRow
                      key={field.key}
                      className={isDifferent ? 'bg-muted/50' : ''}
                    >
                      <TableCell className="font-medium">
                        {field.label}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderFieldValue(field, build1, def1)}
                      </TableCell>
                      <TableCell className="text-center">
                        {isDifferent && (
                          <Badge variant="outline" className="text-xs">
                            Different
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderFieldValue(field, build2, def2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {(build1.errorMessage || build2.errorMessage) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Error Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {build1.errorMessage && (
                <div>
                  <h4 className="font-medium mb-2">Build 1 Error:</h4>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <pre className="text-xs whitespace-pre-wrap">
                      {build1.errorMessage.substring(0, 500)}
                      {build1.errorMessage.length > 500 && '...'}
                    </pre>
                  </div>
                </div>
              )}
              {build2.errorMessage && (
                <div>
                  <h4 className="font-medium mb-2">Build 2 Error:</h4>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <pre className="text-xs whitespace-pre-wrap">
                      {build2.errorMessage.substring(0, 500)}
                      {build2.errorMessage.length > 500 && '...'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function BuildComparisonTool({
  builds,
  definitions,
  onBuildSelect,
  onClose,
}: BuildComparisonToolProps) {
  const [selectedBuilds, setSelectedBuilds] = useState<MobileAppBuild[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const definitionMap = new Map<string, MobileAppDefinition>();
  definitions.forEach((def) => definitionMap.set(def.id, def));

  const handleBuildSelect = (build: MobileAppBuild, add: boolean) => {
    if (add) {
      if (selectedBuilds.length < 2) {
        setSelectedBuilds([...selectedBuilds, build]);
      }
    } else {
      setSelectedBuilds(selectedBuilds.filter((b) => b.id !== build.id));
    }
  };

  const handleCompare = () => {
    if (selectedBuilds.length === 2) {
      setIsDialogOpen(true);
    }
  };

  const clearSelection = () => {
    setSelectedBuilds([]);
  };

  const enrichedBuilds = builds.map((build) => ({
    ...build,
    definition: definitionMap.get(build.appDefinitionId),
  }));

  const comparisonData: ComparisonData | null =
    selectedBuilds.length === 2
      ? {
          builds: [selectedBuilds[0], selectedBuilds[1]] as [
            MobileAppBuild,
            MobileAppBuild,
          ],
          definitions: [
            definitionMap.get(selectedBuilds[0].appDefinitionId)!,
            definitionMap.get(selectedBuilds[1].appDefinitionId)!,
          ] as [MobileAppDefinition, MobileAppDefinition],
        }
      : null;

  const metrics = comparisonData
    ? calculatePerformanceMetrics(comparisonData.builds)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <GitCompare className="h-5 w-5" />
          <span>Compare Builds</span>
        </h3>

        <div className="flex items-center space-x-2">
          {selectedBuilds.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          )}

          <Button
            onClick={handleCompare}
            disabled={selectedBuilds.length !== 2}
            className="flex items-center space-x-1"
          >
            <span>Compare ({selectedBuilds.length}/2)</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichedBuilds.map((build) => {
          const isSelected = selectedBuilds.some((b) => b.id === build.id);

          return (
            <Card
              key={build.id}
              className={cn(
                'cursor-pointer transition-colors',
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-muted/50',
              )}
              onClick={() => handleBuildSelect(build, !isSelected)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="font-mono text-sm">
                        {build.id.slice(-8)}
                      </div>
                      {getStatusIcon(build.status)}
                      <Badge variant="outline">{build.status}</Badge>
                    </div>

                    <div className="text-sm">
                      <div className="font-medium">
                        {build.definition?.appName}
                      </div>
                      <div className="text-muted-foreground">
                        {build.definition?.appId}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Module: {build.definition?.appModule}</div>
                      <div>Duration: {formatDuration(build)}</div>
                      <div>
                        Started:{' '}
                        {build.startedAt
                          ? formatDistanceToNow(new Date(build.startedAt), {
                              addSuffix: true,
                            })
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <GitCompare className="h-5 w-5" />
              <span>Build Comparison</span>
            </DialogTitle>
          </DialogHeader>

          {comparisonData && metrics && (
            <ComparisonTable data={comparisonData} metrics={metrics} />
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            {comparisonData && (
              <Button onClick={() => onBuildSelect?.(comparisonData.builds)}>
                Analyze Further
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
