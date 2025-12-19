import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { MobileAppBuild } from '../types';

interface BuildHistoryDetailDrawerProps {
  build: MobileAppBuild | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Stage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  progress?: number;
  logs?: string[];
}

export function BuildHistoryDetailDrawer({
  build,
  open,
  onOpenChange,
}: BuildHistoryDetailDrawerProps) {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string>('');

  const stages: Stage[] = [];
  const stageSnapshotFetchedAt = new Date().toISOString();

  const getStageIcon = (status: Stage['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
      case 'building':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      case 'queued':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const fetchConsoleLogs = async (stage: Stage) => {
    if (!build?.consoleUrl) return;

    try {
      // In a real implementation, this would fetch stage-specific logs
      // For now, we'll simulate with a placeholder
      setConsoleLogs(
        `Console logs for stage: ${stage.name}\n\n[${new Date().toISOString()}] Starting ${stage.name}...\n[${new Date().toISOString()}] Executing build steps...\n[${new Date().toISOString()}] ${stage.status === 'success' ? 'Stage completed successfully' : 'Stage failed with errors'}`,
      );
    } catch (error) {
      console.error('Failed to fetch console logs:', error);
      setConsoleLogs('Failed to load console logs');
    }
  };

  useEffect(() => {
    if (selectedStage) {
      fetchConsoleLogs(selectedStage);
    }
  }, [selectedStage]);

  if (!build) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Build Details - {build.id}</span>
            <Badge className={getStatusColor(build.status)}>
              {build.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Build Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Build Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Started By</p>
                  <p className="font-medium">{build.startedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Started At</p>
                  <p className="font-medium">
                    {build.startedAt
                      ? new Date(build.startedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {build.durationMs
                      ? formatDuration(build.durationMs)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Build Type</p>
                  <p className="font-medium">{build.buildType || 'N/A'}</p>
                </div>
              </div>

              {build.errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800">
                    Error Message:
                  </p>
                  <p className="text-sm text-red-600">{build.errorMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline Stages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Pipeline Stages
                {stageSnapshotFetchedAt && (
                  <span className="text-sm text-muted-foreground font-normal">
                    Last updated:{' '}
                    {new Date(stageSnapshotFetchedAt).toLocaleString()}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stages.length > 0 ? (
                <div className="space-y-3">
                  {stages.map((stage: Stage, index: number) => (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedStage(stage)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-muted-foreground/20">
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        {getStageIcon(stage.status)}
                        <div>
                          <p className="font-medium">{stage.name}</p>
                          {stage.duration && (
                            <p className="text-sm text-muted-foreground">
                              Duration: {formatDuration(stage.duration)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {stage.progress !== undefined && (
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${stage.progress}%` }}
                            />
                          </div>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {stage.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {build.status === 'building'
                    ? 'Waiting for stage information...'
                    : 'No stage information available'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Console Output */}
          {selectedStage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Console Output - {selectedStage.name}
                  <div className="flex space-x-2">
                    {build.consoleUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(build.consoleUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Jenkins
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStage(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full border rounded-md p-4 overflow-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {consoleLogs ||
                      `No console logs available for stage: ${selectedStage.name}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {(build.buildParameters || build.performanceMetrics) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {build.buildParameters && (
                    <div>
                      <h4 className="font-medium mb-2">Build Parameters</h4>
                      <div className="h-32 w-full border rounded-md p-3 overflow-auto">
                        <pre className="text-xs">
                          {typeof build.buildParameters === 'string'
                            ? build.buildParameters
                            : JSON.stringify(build.buildParameters, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {build.performanceMetrics && (
                    <div>
                      <h4 className="font-medium mb-2">Performance Metrics</h4>
                      <div className="h-32 w-full border rounded-md p-3 overflow-auto">
                        <pre className="text-xs">
                          {typeof build.performanceMetrics === 'string'
                            ? build.performanceMetrics
                            : JSON.stringify(build.performanceMetrics, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
