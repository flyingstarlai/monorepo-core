import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  useJenkinsQueue,
  useJenkinsStatus,
} from '@/features/app-builder/hooks/use-app-builder';
import { Activity, Clock, AlertCircle, CheckCircle } from 'lucide-react';

function AppBuilderSystemStatusPage() {
  const {
    data: jenkinsStatus,
    isLoading: isStatusLoading,
    refetch: refetchStatus,
  } = useJenkinsStatus();
  const {
    data: queueInfo,
    isLoading: isQueueLoading,
    refetch: refetchQueue,
  } = useJenkinsQueue();

  const handleStatusRefresh = () => {
    refetchStatus();
    refetchQueue();
  };

  const connectionBadgeVariant = isStatusLoading
    ? 'secondary'
    : jenkinsStatus?.connected
      ? 'default'
      : 'destructive';

  const connectionLabel = isStatusLoading
    ? 'Checking...'
    : jenkinsStatus?.connected
      ? 'Connected'
      : jenkinsStatus?.message || 'Unavailable';

  const statusUpdatedAt = jenkinsStatus?.fetchedAt
    ? formatDistanceToNow(new Date(jenkinsStatus.fetchedAt), {
        addSuffix: true,
      })
    : null;

  const queueBadgeVariant = isQueueLoading
    ? 'secondary'
    : queueInfo?.totalItems
      ? 'default'
      : 'outline';

  const queueLabel = isQueueLoading
    ? 'Checking...'
    : `${queueInfo?.totalItems ?? 0} Queued`;

  const queueUpdatedAt = queueInfo?.fetchedAt
    ? formatDistanceToNow(new Date(queueInfo.fetchedAt), { addSuffix: true })
    : null;

  const recentQueueItems = queueInfo?.items?.slice(0, 5) ?? [];
  const queueEmptyMessage =
    queueInfo?.available === false
      ? queueInfo?.message || 'Queue information unavailable'
      : 'No builds currently waiting in queue';

  const getQueueTimeLabel = (queuedAt?: string) => {
    if (!queuedAt) {
      return 'Queued just now';
    }
    try {
      return formatDistanceToNow(new Date(queuedAt), { addSuffix: true });
    } catch {
      return 'Queued recently';
    }
  };

  const getStatusIcon = () => {
    if (isStatusLoading) return <Clock className="w-4 h-4 animate-spin" />;
    if (jenkinsStatus?.connected)
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-muted-foreground">
            Real-time Jenkins connection status and build queue monitoring
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleStatusRefresh}
          disabled={isStatusLoading && isQueueLoading}
        >
          Refresh Status
        </Button>
      </div>

      {/* Jenkins Connection Status */}
      <Card>
        <CardHeader className="flex items-center gap-3">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Jenkins Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={connectionBadgeVariant} className="text-sm">
                  {connectionLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isStatusLoading
                  ? 'Checking Jenkins connection...'
                  : jenkinsStatus?.message || 'Status unavailable'}
              </p>
              {jenkinsStatus?.url && (
                <p className="text-xs text-muted-foreground break-all">
                  Target: {jenkinsStatus.url}
                  {jenkinsStatus?.jobName && (
                    <>
                      {' • Job: '}
                      <span className="font-mono">{jenkinsStatus.jobName}</span>
                    </>
                  )}
                </p>
              )}
              {jenkinsStatus?.serverVersion && (
                <p className="text-xs text-muted-foreground">
                  Version: {jenkinsStatus.serverVersion}
                </p>
              )}
              {statusUpdatedAt && (
                <p className="text-xs text-muted-foreground">
                  Updated {statusUpdatedAt}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Build Queue Information */}
      <Card>
        <CardHeader className="flex items-center gap-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Build Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Queue Status</span>
                <Badge variant={queueBadgeVariant} className="text-sm">
                  {queueLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isQueueLoading
                  ? 'Checking Jenkins queue...'
                  : queueInfo?.available === false
                    ? queueInfo?.message || 'Queue unavailable'
                    : 'Monitoring Jenkins queue'}
              </p>
              {queueUpdatedAt && (
                <p className="text-xs text-muted-foreground">
                  Updated {queueUpdatedAt}
                </p>
              )}
            </div>
          </div>

          {recentQueueItems.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Recent Queue Items</h3>
                <span className="text-xs text-muted-foreground">
                  Showing {recentQueueItems.length} of{' '}
                  {queueInfo?.totalItems || 0}
                </span>
              </div>
              <div className="space-y-2">
                {recentQueueItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4 text-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {item.jobName || 'Unknown job'}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          Queue ID: {item.id}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getQueueTimeLabel(item.queuedAt)}
                      </span>
                    </div>
                    {item.why && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Reason:</span> {item.why}
                      </div>
                    )}
                    {item.url && (
                      <div className="text-xs">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Job →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {queueInfo && queueInfo.totalItems > recentQueueItems.length && (
                <p className="text-xs text-muted-foreground">
                  +{queueInfo.totalItems - recentQueueItems.length} more items
                  in queue
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {queueEmptyMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute(
  '/_authenticated/app-builder/system-status',
)({
  component: AppBuilderSystemStatusPage,
});
